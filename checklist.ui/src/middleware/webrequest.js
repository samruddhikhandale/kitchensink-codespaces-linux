// This file is an HTTP middleware facilitating REST API communication.

const defaultRequestOptions = {
    mode: 'cors',
    headers: {
        'Content-Type': 'application/json'
    }
};

/**
 * Issue a GET request against given URL, and return the response.
 * @param {string} url 
 */
export const get = async (url) => {
    const requestOptions = {
        ...defaultRequestOptions,
        method: 'GET',
    };

    return await executeRequest(url, requestOptions);
}

/**
 * Issue a POST request against given URL, with given data and return the response.
 * @param {string} url 
 * @param {Object} data 
 */
export const post = async (url, data) => {
    const requestOptions = {
        ...defaultRequestOptions,
        method: 'POST',
        body: JSON.stringify(data)
    };

    return await executeRequest(url, requestOptions);
}

/**
 * Issue a PUT request against given URL, with given data and return the response.
 * @param {string} url 
 * @param {Object} data 
 */
export const put = async (url, data) => {
    const requestOptions = {
        ...defaultRequestOptions,
        method: 'PUT',
        body: JSON.stringify(data)
    };

    return await executeRequest(url, requestOptions);
}

/**
 * Issue a DELETE request against given URL
 * @param {string} url 
 * @param {Object} data 
 */
export const del = async (url) => {
    const requestOptions = {
        ...defaultRequestOptions,
        method: 'DELETE',
    };

    return await executeRequest(url, requestOptions);
}

const executeRequest = async (url, requestOptions) => {
    return await fetch(url, requestOptions);
}