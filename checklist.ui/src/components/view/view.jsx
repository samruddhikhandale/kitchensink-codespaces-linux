import React, { useEffect, useState, useCallback } from 'react';
import {
    fetchChecklist,
    updateChecklist,
    deleteChecklist,
    addItem,
    updateItem,
    deleteItem,
    NotFoundError
} from '../../service';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

/**
 * Critical component that displays the list. This is where the user can edit the list, add/update/remove/complete todo items.
 */
export default function View(props) {
    const [checklist, setChecklist] = useState();
    const [validated, setValidated] = useState(false);
    const [lastFetch, setLastFetch] = useState(0);
    const [itemSaving, setItemSaving] = useState({});
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    /**
     * Sets a local flag to indicate the items that are being saved to backend. This flag is used to show the spinner while saving.
     */
    const handleItemSaving = useCallback((itemId, state) => {
        const itemSavingCopy = { ...itemSaving };
        itemSavingCopy[itemId] = state;
        setItemSaving(itemSavingCopy);
    }, [itemSaving]);

    /***
     * Save modifications made to a list item.
     * Checkbox changes are saved as soon as the user cliks on it.
     * Text/data changes are saved when the user fills in the field and focus out.
     */
    const handleUpdateItem = useCallback(async (save, item) => {
        handleItemSaving(item._id, true);
        try {
            let updatedItem = { ...item };
            console.log(save, item)
            if (save) {
                updatedItem = await updateItem(checklist._id, item);
            }

            const index = checklist.listItems.findIndex(x => x._id === updatedItem._id);
            console.log(updatedItem, index, checklist);
            if (index !== -1) {
                const listItems = checklist.listItems.map((existingItem, _index) =>
                    index === _index ? updatedItem : existingItem
                );
                setChecklist({ ...checklist, listItems });
            }
        } catch (err) {
            if (!err.message) {
                err.message = 'Failed to update the checklist item.';
            }

            setErrorMessage(err.message);
            setShowError(true);
        }
        finally {
            handleItemSaving(item._id, false);
        }
    }, [checklist, handleItemSaving]);

    /**
     * Delete an item from the list.
     */
    const handleDeleteItem = useCallback(async (item) => {
        handleItemSaving(item._id, true);
        try {
            // API call to delete.
            await deleteItem(checklist._id, item);

            const index = checklist.listItems.findIndex(x => x._id === item._id);
            if (index !== -1) {
                const listItems = checklist.listItems.filter((x, i) => i !== index);
                setChecklist({ ...checklist, listItems });
            }
        } catch (err) {
            if (!err.message) {
                err.message = 'Failed to delete the checklist item.';
            }

            setErrorMessage(err.message);
            setShowError(true);
        }
        finally {
            handleItemSaving(item._id, false);
        }

    }, [checklist, handleItemSaving]);

    /**
     * Add a new item to the list.
     */
    const handleAddItem = useCallback(async () => {
        try {
            // API call to add.
            const item = await addItem(checklist._id, { data: '', checked: false });
            const listItems = [...checklist.listItems, item];

            setChecklist({ ...checklist, listItems });
        } catch (err) {
            if (!err.message) {
                err.message = 'Failed to add the checklist item.';
            }

            setErrorMessage(err.message);
            setShowError(true);
        }

    }, [checklist]);

    /**
     * Save checklist when the changes as made to the checklist title.
     */
    const handleUpdateChecklist = useCallback(async (event) => {
        setValidated(true);
        if (!event.target.value) {
            // Do not update if title is empty.
            return;
        }

        try {
            // API call to add.
            await updateChecklist({ _id: checklist._id, title: event.target.value });
        } catch (err) {
            if (!err.message) {
                err.message = 'Failed to update the checklist.';
            }

            setErrorMessage(err.message);
            setShowError(true);
        }
    }, [checklist]);

    /**
     * Delete a checklist and automatically navigate the user to home page upon deletion.
     */
    const handleDelete = useCallback(async (event) => {
        try {
            const id = checklist._id;
            await deleteChecklist(checklist);

            // Remove from recent lists
            let recentChecklists = JSON.parse(localStorage.getItem('recentChecklists')) || [];
            recentChecklists = recentChecklists.filter((existingList) => existingList._id !== id);
            localStorage.setItem('recentChecklists', JSON.stringify(recentChecklists));

            props.history.push('/');
        } catch (err) {
            if (!err.message) {
                err.message = 'Failed to delete the checklist.';
            }

            setErrorMessage(err.message);
            setShowError(true);
        }
    }, [checklist, props.history]);

    /**
     * Effect to load the list on initial render as well as to refresh the list data periodically, so that simulaneous changes made by other users are reflected.
     */
    useEffect(() => {
        const handleFetchChecklist = async () => {
            if (Date.now() - lastFetch > 5000) {
                setLastFetch(Date.now());
                try {
                    const freshChecklist = await fetchChecklist(props.match.params.checklistId);

                    if (checklist && freshChecklist.lastUpdated <= checklist.lastUpdated) {
                        return; // Data has not changed.
                    }

                    setChecklist(freshChecklist);

                    // Update recent checklists in local storage
                    let recentChecklists = JSON.parse(localStorage.getItem('recentChecklists')) || [];
                    const index = recentChecklists.findIndex(x => x._id === freshChecklist._id);
                    if (index === -1) {
                        recentChecklists.push(freshChecklist);
                    }
                    else {
                        recentChecklists = recentChecklists.map((existingList, i) => index === i ? freshChecklist : existingList);
                    }

                    localStorage.setItem('recentChecklists', JSON.stringify(recentChecklists));
                } catch (err) {
                    setChecklist(null);
                    if (err instanceof NotFoundError) {
                        // Remove from recent lists
                        let recentChecklists = JSON.parse(localStorage.getItem('recentChecklists')) || [];
                        recentChecklists = recentChecklists.filter((existingList) => existingList._id !== props.match.params.checklistId);
                        localStorage.setItem('recentChecklists', JSON.stringify(recentChecklists));
                        setErrorMessage(err.message);
                        setShowError(true);
                    }
                    else {
                        setErrorMessage("The checklist you are trying to access is not valid or is unavailable.");
                        setShowError(true);
                    }
                }
            }
        }

        handleFetchChecklist(); // Fetch for the first time
        const intervals = [];
        const i = setInterval(() => handleFetchChecklist(), 3000); // Refresh every 3 seconds
        intervals.push(i);

        return function cleanup() {
            intervals.forEach(interval => clearInterval(interval));
        };
    }, [checklist, lastFetch, props.match.params.checklistId])

    return (
        <div>
            {showError &&
                <Alert variant='danger' onClose={() => setShowError(false)} dismissible className='m-1'>
                    {errorMessage}
                </Alert>
            }

            {checklist &&
                <Form noValidate validated={validated} className="mb-3">
                    <Form.Group controlId="formGridTitle">
                        <Form.Label><b>ID</b>: <i>{checklist._id}</i></Form.Label>
                        <InputGroup>
                            <Form.Control
                                data-testid="checklist-title"
                                placeholder="Enter title"
                                value={checklist?.title || ''}
                                onChange={(e) => { setChecklist({ ...checklist, title: e.target.value }); }}
                                required
                                maxLength={100}
                                onBlur={handleUpdateChecklist} />
                            <InputGroup.Append>
                                <Button variant="danger" onClick={handleDelete}>
                                    Delete List
                            </Button>
                            </InputGroup.Append>
                        </InputGroup>
                    </Form.Group >
                </Form>
            }
            {checklist?.listItems.map(item =>
                <InputGroup className="mb-3" key={item._id}>
                    <InputGroup.Prepend>
                        <InputGroup.Checkbox
                            aria-label="Checklist checkbox"
                            checked={item.checked}
                            onChange={(e) => { handleUpdateItem(true, { ...item, checked: e.target.checked }); }}
                            onBlur={async (e) => {
                                await handleUpdateItem(true, { ...item, checked: e.target.checked });
                            }}
                        />
                    </InputGroup.Prepend>
                    <FormControl
                        aria-label="Checklist item value"
                        value={item.data}
                        onChange={(e) => { handleUpdateItem(false, { ...item, data: e.target.value }); }}
                        onBlur={(e) => {
                            handleUpdateItem(true, { ...item, data: e.target.value });
                        }}
                    />
                    <InputGroup.Append>
                        {itemSaving[item._id] ?
                            <Spinner animation="border" variant="secondary" className="m-1" />
                            :
                            <Button variant="light" onClick={(e) => handleDeleteItem(item)}> <FontAwesomeIcon icon={faTrash} /> </Button>
                        }
                    </InputGroup.Append>
                </InputGroup>
            )}

            {checklist && < Button className='mt-2 mb-4' onClick={handleAddItem} ><FontAwesomeIcon icon={faPlus} /> </Button>}
        </div >
    );
}
