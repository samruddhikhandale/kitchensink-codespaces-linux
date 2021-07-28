import React, { useState } from 'react';

import { Link } from 'react-router-dom';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';

/**
 * Componet that shows mainoperations (create and access list), which is displayed on all screens.
 */
export default function MainOptions(props) {
    const [validated, setValidated] = useState(false);
    const [checklistId, setChecklistId] = useState();

    const handleSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const form = event.currentTarget;

        if (form.checkValidity()) {
            // Submit
            props.history.push(`/view/${checklistId}`);
        }

        setValidated(true);
    };

    return (
        <div>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <InputGroup className="mb-3">
                    <FormControl
                        placeholder="Checklist ID"
                        aria-label="Checklist ID"
                        aria-describedby="basic-addon1"
                        onChange={(e) => setChecklistId(e.target.value)}
                        required
                    />
                    <InputGroup.Append>
                        <Button variant="primary" className="mr-1" type="submit">Access</Button>
                        <Link to="/create">
                            <Button className="mr-1" variant="success">
                                Create New
                            </Button >
                        </Link>
                    </InputGroup.Append>
                </InputGroup>
            </Form>
        </div>
    );
}