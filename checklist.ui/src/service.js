// Service which is communicating with the backend application to fullfill requests.

import { get, post, put, del } from './middleware/webrequest';

const BASE_URL = '/api/checklists'

/**
 * Fetch the checklist with given id.
 * @param {string} checklistId 
 */
export const fetchChecklist = async (checklistId) => {
    const response = await get(`${BASE_URL}/${checklistId}`);

    // If the response is Not found, return the reponse code, so the client can take approproiate decision.
    if (response.status === 404) {
        throw new NotFoundError("Checklist does not exist.")
    }

    if (response.ok) {
        return await response.json();
    }

    throw new Error(await response.json());
}

/**
 * Create a new checklist with given data and return the created checklist.
 * @param {Object} checklist 
 */
export const createChecklist = async (checklist) => {
    const response = await post(BASE_URL, checklist);
    if (response.ok) {
        return await response.json();
    }

    throw new Error(await response.json());
}

/**
 * Update the given checklist and return the updated checklist
 * @param {Object} checklist 
 */
export const updateChecklist = async (checklist) => {
    const response = await put(`${BASE_URL}/${checklist._id}`, checklist);
    if (response.ok) {
        return await response.json();
    }

    throw new Error(await response.json());
}

/**
 * Delete the given checklist.
 */
export const deleteChecklist = async (checklist) => {
    const response = await del(`${BASE_URL}/${checklist._id}`);
    if (response.ok) {
        return;
    }

    throw new Error(await response.json());
}

/**
 * Add given item to the specified checklist and return the added item.
 * @param {string} checklistId 
 * @param {Object} item 
 */
export const addItem = async (checklistId, item) => {
    const response = await post(`${BASE_URL}/${checklistId}/items`, item);
    if (response.ok) {
        return await response.json();
    }

    throw new Error(await response.json());
}

/**
 * * Update given item on the specified checklist and return the updated item.
 * @param {string} checklistId 
 * @param {Object} item 
 */
export const updateItem = async (checklistId, item) => {
    const response = await put(`${BASE_URL}/${checklistId}/items/${item._id}`, item);
    if (response.ok) {
        return await response.json();
    }

    throw new Error(await response.json());
}

/**
 * Delete given item from the specified checklist.
 * @param {string} checklistId 
 * @param {Object} item 
 */
export const deleteItem = async (checklistId, item) => {
    const response = await del(`${BASE_URL}/${checklistId}/items/${item._id}`);
    if (response.ok) {
        return;
    }

    throw new Error(await response.json());
}

/**
 * Custom error that should be thrown when server returns 404.
 */
export class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "NotFoundError";
    }
}
