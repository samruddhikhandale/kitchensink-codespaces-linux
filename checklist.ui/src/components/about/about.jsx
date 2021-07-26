import React from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import logo from '../../logo.png';

/**
 * About / Info component.
 */
export default function About() {
    return (
        <div>
            <h4>ShaDo - Easy to share checklists / todos.</h4>
            <p>Creating, managing and sharing checklists / todo lists has never been easier.</p>

            <Row className="m-2">
                <Col md="xs">
                    <img src={logo} alt="shareable checklists" width="100px" height="100px" />
                </Col>
                <Col>
                    <p>With <b><i>ShaDo</i></b> - <i> the shareable checklists</i> app one can easily create checklists, add or remove todo items, mark them as done on the go.
                    Most importantly if you are working on a plan with others, you can create a checklist and share with them. Everyone with a link to the list can add/edit todo items as well as mark items as done when they are done.</p>

                </Col>
            </Row>
            <Row className="m-2">
                <p>Be it a list of places you want to visit, set of tasks for your personal projects, or even a list of grocery items to buy which you want to edit along with your family members - <b><i>ShaDo</i></b> is your best companion.</p>
            </Row>
        </div>
    );
}