import React from 'react';

import { Link } from 'react-router-dom';

import Navbar from 'react-bootstrap/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import logo from '../../logo.png';
import './header.css';

/**
 * Page header with logo and title, to be displayed on all screens
 */
export default function Header() {
    return (
        <div>
            <Navbar bg="dark" variant="dark">
                <Navbar.Brand>
                    <Link to="/">
                        <img
                            alt="ShaDo - Shared Checklists"
                            src={logo}
                            className="logo d-inline-block align-top"
                        />
                    </Link>
                    <b>ShaDo</b>&nbsp;-&nbsp;<i>Shared&nbsp;Checklists</i>
                </Navbar.Brand>
                <Navbar.Collapse className="justify-content-end">
                    <Navbar.Text className="mr-2">
                        <Link to="/about"><FontAwesomeIcon icon={faInfoCircle} size="lg" /></Link>
                    </Navbar.Text>
                </Navbar.Collapse>
            </Navbar>
        </div>
    );
}