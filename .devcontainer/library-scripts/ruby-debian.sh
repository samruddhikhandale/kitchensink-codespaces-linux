#!/usr/bin/env bash
#-------------------------------------------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See https://go.microsoft.com/fwlink/?linkid=2090316 for license information.
#-------------------------------------------------------------------------------------------------------------
#
# Docs: https://github.com/microsoft/vscode-dev-containers/blob/main/script-library/docs/ruby.md
# Maintainer: The VS Code and Codespaces Teams
#
# Syntax: ./ruby-debian.sh [Ruby version] [non-root user] [Add to rc files flag] [Install tools flag]

RUBY_VERSION=${1:-"latest"}
USERNAME=${2:-"automatic"}
UPDATE_RC=${3:-"true"}
INSTALL_RUBY_TOOLS=${6:-"true"}

RVM_PGP_FINGERPRINTS="409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB"

set -e

if [ "$(id -u)" -ne 0 ]; then
    echo -e 'Script must be run as root. Use sudo, su, or add "USER root" to your Dockerfile before running this script.'
    exit 1
fi

# Ensure that login shells get the correct path if the user updated the PATH using ENV.
rm -f /etc/profile.d/00-restore-env.sh
echo "export PATH=${PATH//$(sh -lc 'echo $PATH')/\$PATH}" > /etc/profile.d/00-restore-env.sh
chmod +x /etc/profile.d/00-restore-env.sh

# Determine the appropriate non-root user
if [ "${USERNAME}" = "auto" ] || [ "${USERNAME}" = "automatic" ]; then
    USERNAME=""
    POSSIBLE_USERS=("vscode" "node" "codespace" "$(awk -v val=1000 -F ":" '$3==val{print $1}' /etc/passwd)")
    for CURRENT_USER in ${POSSIBLE_USERS[@]}; do
        if id -u ${CURRENT_USER} > /dev/null 2>&1; then
            USERNAME=${CURRENT_USER}
            break
        fi
    done
    if [ "${USERNAME}" = "" ]; then
        USERNAME=root
    fi
elif [ "${USERNAME}" = "none" ] || ! id -u ${USERNAME} > /dev/null 2>&1; then
    USERNAME=root
fi

# Determine appropriate settings for rvm
DEFAULT_GEMS="rake ruby-debug-ide debase"
if [ "${RUBY_VERSION}" = "none" ]; then
    RVM_INSTALL_ARGS=""
else
    if [ "${RUBY_VERSION}" = "latest" ] || [ "${RUBY_VERSION}" = "current" ] || [ "${RUBY_VERSION}" = "lts" ]; then
        RVM_INSTALL_ARGS="--ruby"
        RUBY_VERSION=""
    else
        RVM_INSTALL_ARGS="--ruby=${RUBY_VERSION}"
    fi
    if [ "${INSTALL_RUBY_TOOLS}" = "true" ]; then
        SKIP_GEM_INSTALL="true"
    else 
        DEFAULT_GEMS=""
    fi
fi

function updaterc() {
    if [ "${UPDATE_RC}" = "true" ]; then
        echo "Updating /etc/bash.bashrc and /etc/zsh/zshrc..."
        echo -e "$1" >> /etc/bash.bashrc
        if [ -f "/etc/zsh/zshrc" ]; then
            echo -e "$1" >> /etc/zsh/zshrc
        fi
    fi
}

export DEBIAN_FRONTEND=noninteractive

ARCHITECTURE="$(uname -m)"
if [ "${ARCHITECTURE}" != "amd64" ] && [ "${ARCHITECTURE}" != "x86_64" ] && [ "${ARCHITECTURE}" != "arm64" ] && [ "${ARCHITECTURE}" != "aarch64" ]; then
    echo "(!) Architecture $ARCHITECTURE unsupported"
    exit 1
fi

# Install curl, software-properties-common, build-essential, gnupg2 if missing
if ! dpkg -s curl ca-certificates software-properties-common build-essential gnupg2 libreadline-dev procps git > /dev/null 2>&1; then
    if [ ! -d "/var/lib/apt/lists" ] || [ "$(ls /var/lib/apt/lists/ | wc -l)" = "0" ]; then
        apt-get update
    fi
    apt-get -y install --no-install-recommends curl ca-certificates software-properties-common build-essential gnupg2 libreadline-dev procps git 
fi

# Just install Ruby if RVM already installed
if [ -d "/usr/local/rvm" ]; then
    echo "Ruby Version Manager already exists."
    if [ "${RUBY_VERSION}" != "none" ]; then
        echo "Installing specified Ruby version."
        su ${USERNAME} -c ". /usr/local/rvm/scripts/rvm && rvm install ruby ${RUBY_VERSION}"
    fi
    SKIP_GEM_INSTALL="false"
else
    # Use a temporary locaiton for gpg keys to avoid polluting image
    export GNUPGHOME="/tmp/rvm-gnupg"
    mkdir -p ${GNUPGHOME}
    chmod 700 ${GNUPGHOME}
    cat << 'EOF' > /tmp/rvm-gnupg/dirmngr.conf
disable-ipv6
keyserver hkps://keys.openpgp.org
keyserver hkp://keyserver.ubuntu.com:80
keyserver hkp://keyserver.pgp.com
EOF
    # GPG key download sometimes fails for some reason and retrying fixes it.
    RETRY_COUNT=0
    GPG_OK="false"
    set +e
    until [ "${GPG_OK}" = "true" ] || [ "${RETRY_COUNT}" -eq "5" ]; 
    do
        echo "(*) Downloading GPG key..."
        gpg --recv-keys ${RVM_PGP_FINGERPRINTS} 2>&1 && GPG_OK="true"
        if [ "${GPG_OK}" != "true" ]; then
            echo "(*) Failed getting key, retring in 10s..."
            (( RETRY_COUNT++ ))
            sleep 10s
        fi
    done
    set -e
    if [ "${GPG_OK}" = "false" ]; then
        echo "(!) Failed to install rvm."
        exit 1
    fi

    # Install RVM
    curl -sSL https://get.rvm.io | bash -s stable --ignore-dotfiles ${RVM_INSTALL_ARGS} --with-default-gems="${DEFAULT_GEMS}" 2>&1
    usermod -aG rvm ${USERNAME}
    su ${USERNAME} -c ". /usr/local/rvm/scripts/rvm && rvm fix-permissions system"
    rm -rf ${GNUPGHOME}
fi

if [ "${INSTALL_RUBY_TOOLS}" = "true" ] && [ "${SKIP_GEM_INSTALL}" != "true" ]; then
    # Non-root user may not have "gem" in path when script is run and no ruby version
    # is installed by rvm, so handle this by using root's default gem in this case
    ROOT_GEM="$(which gem)"
    su ${USERNAME} -c ". /usr/local/rvm/scripts/rvm && \"$(which gem || ${ROOT_GEM})\" install ${DEFAULT_GEMS}"
fi

# VS Code server usually first in the path, so silence annoying rvm warning (that does not apply) and then source it
updaterc "if ! grep rvm_silence_path_mismatch_check_flag \$HOME/.rvmrc > /dev/null 2>&1; then echo 'rvm_silence_path_mismatch_check_flag=1' >> \$HOME/.rvmrc; fi\nsource /usr/local/rvm/scripts/rvm > /dev/null 2>&1"

# Install rbenv/ruby-build for good measure
git clone --depth=1 \
    -c core.eol=lf \
    -c core.autocrlf=false \
    -c fsck.zeroPaddedFilemode=ignore \
    -c fetch.fsck.zeroPaddedFilemode=ignore \
    -c receive.fsck.zeroPaddedFilemode=ignore \
    https://github.com/rbenv/rbenv.git /usr/local/share/rbenv
ln -s /usr/local/share/rbenv/bin/rbenv /usr/local/bin
updaterc 'eval "$(rbenv init -)"'
git clone --depth=1 \
    -c core.eol=lf \
    -c core.autocrlf=false \
    -c fsck.zeroPaddedFilemode=ignore \
    -c fetch.fsck.zeroPaddedFilemode=ignore \
    -c receive.fsck.zeroPaddedFilemode=ignore \
    https://github.com/rbenv/ruby-build.git /usr/local/share/ruby-build
mkdir -p /root/.rbenv/plugins
ln -s /usr/local/share/ruby-build /root/.rbenv/plugins/ruby-build
if [ "${USERNAME}" != "root" ]; then
    mkdir -p /home/${USERNAME}/.rbenv/plugins
    chown -R ${USERNAME} /home/${USERNAME}/.rbenv
    ln -s /usr/local/share/ruby-build /home/${USERNAME}/.rbenv/plugins/ruby-build
fi

# Clean up
source /usr/local/rvm/scripts/rvm
rvm cleanup all 
gem cleanup
echo "Done!"