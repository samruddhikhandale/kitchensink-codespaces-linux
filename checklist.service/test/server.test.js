const request = require("supertest");
const app = require("../server");
const ChecklistModel = require('../models/checklistModel');

const fakeChecklist = {
    "_id": "5ef7acb26d80632ef40fe23b",
    "title": "Countries to visit",
    "lastUpdated": "2020-06-28T03:26:09.056Z",
    "listItems": [
        {
            "_id": "5ef7acb36d80632ef40fe23b",
            "data": "USA",
            "checked": true
        },
        {
            "_id": "5ef7acb76d80632ef40fe23d",
            "data": "Germany",
            "checked": false
        }
    ],
    "__v": 11
};

describe("Test retrieve checklist", () => {
    test("It should respond with an existing checklist", async () => {
        jest.spyOn(ChecklistModel, 'findById')
            .mockImplementationOnce(() => Promise.resolve(fakeChecklist));

        const response = await request(app).get("/api/checklists/5ef7acb26d80632ef40fe23b");
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(fakeChecklist);
    });
});

describe("Test retrieve checklist with wrong id", () => {
    test("It should respond with 404", async () => {
        jest.spyOn(ChecklistModel, 'findById')
            .mockImplementationOnce(() => Promise.resolve(null));

        const response = await request(app).get("/api/checklists/5ef7acb26d80632ef40fe23b");
        expect(response.statusCode).toBe(404);
    });
});

describe("Test create checklist", () => {
    test("It should respond with created checklist", async () => {
        const createInput = {
            "title": "Countries to visit"
        };

        const createOutput = {
            "_id": "5ef7acb26d80632ef40fe23b",
            "title": "Countries to visit",
            "lastUpdated": "2020-06-28T03:26:09.056Z",
        }

        jest.spyOn(ChecklistModel.prototype, 'save')
            .mockImplementationOnce(() => Promise.resolve(createOutput));

        const response = await request(app).post("/api/checklists").send(createInput);
        expect(response.statusCode).toBe(200);
        expect(response.body.title).toEqual(createInput.title);
        expect(response.body.lastUpdated).toBeDefined();
    });
});

describe("Test update checklist", () => {
    test("It should respond with updated checklist", async () => {
        const updateInput = {
            "title": "Countries to visit"
        };

        const updateOutput = {
            "_id": "5ef7acb26d80632ef40fe23b",
            "title": "Countries to visit",
            "lastUpdated": "2020-06-28T03:26:09.056Z",
        }

        jest.spyOn(ChecklistModel, 'findOneAndUpdate')
            .mockImplementationOnce(() => Promise.resolve(updateOutput));

        const response = await request(app).put("/api/checklists/5ef7acb26d80632ef40fe23b").send(updateInput);
        expect(response.statusCode).toBe(200);
        expect(response.body.title).toEqual(updateInput.title);
        expect(response.body.lastUpdated).toBeDefined();
    });
});

describe("Test delete checklist", () => {
    test("It should respond with 204", async () => {
        jest.spyOn(ChecklistModel.prototype, 'deleteOne')
            .mockImplementationOnce(() => Promise.resolve());

        const response = await request(app).delete("/api/checklists/5ef7acb26d80632ef40fe23b");
        expect(response.statusCode).toBe(204);
    });
});

describe("Test add an item to checklist", () => {
    test("It should respond with created item", async () => {
        const addItemInput = {
            data: "USA",
            checked: false
        };

        const addItemOutput = {
            "_id": "5ef7acb26d80632ef40fe23b",
            data: "USA",
            checked: false
        }

        jest.spyOn(ChecklistModel, 'findById')
            .mockImplementationOnce(() => Promise.resolve({ listItems: [], save: () => Promise.resolve({ listItems: [addItemOutput] }) }));

        const response = await request(app).post("/api/checklists/5ef7acb26d80632ef40fe23b/items").send(addItemInput);
        expect(response.statusCode).toBe(200);
        expect(response.body.data).toEqual(addItemInput.data);
        expect(response.body._id).toBeDefined();
    });
});

describe("Test update an item in a checklist", () => {
    test("It should respond with updated item", async () => {
        const updateItemInput = {
            data: "USA",
            checked: false
        };

        const updateItemOutput = {
            "_id": "5ef7acb26d80632ef40fe23b",
            data: "USA",
            checked: false
        }

        jest.spyOn(ChecklistModel, 'findOneAndUpdate')
            .mockImplementationOnce(() => Promise.resolve({ listItems: { id: (id) => updateItemOutput } }));

        const response = await request(app).put("/api/checklists/5ef7acb26d80632ef40fe23b/items/5ef7acb76d80632ef40fe23d").send(updateItemInput);
        expect(response.statusCode).toBe(200);
        expect(response.body.data).toEqual(updateItemInput.data);
        expect(response.body._id).toBeDefined();
    });
});

describe("Test update an item in a non existing checklist", () => {
    test("It should respond with 404", async () => {
        const updateItemInput = {
            data: "USA",
            checked: false
        };

        jest.spyOn(ChecklistModel, 'findOneAndUpdate')
            .mockImplementationOnce(() => Promise.resolve(null));

        const response = await request(app).put("/api/checklists/5ef7acb26d80632ef40fe23b/items/5ef7acb76d80632ef40fe23d").send(updateItemInput);
        expect(response.statusCode).toBe(404);
    });
});

describe("Test delete an item in a checklist", () => {
    test("It should respond with 204", async () => {
        const itemToRemove = {
            "_id": "5ef7acb26d80632ef40fe23b",
            data: "USA",
            checked: false,
            remove: () => { }
        }

        jest.spyOn(ChecklistModel, 'findById')
            .mockImplementationOnce(() => Promise.resolve({ save: () => { }, listItems: { id: (id) => itemToRemove } }));

        const response = await request(app).delete("/api/checklists/5ef7acb26d80632ef40fe23b/items/5ef7acb76d80632ef40fe23d");
        expect(response.statusCode).toBe(204);
    });;
});

describe("Test delete an item in a non existing checklist", () => {
    test("It should respond with 404", async () => {
        jest.spyOn(ChecklistModel, 'findById')
            .mockImplementationOnce(() => Promise.resolve(null));

        const response = await request(app).delete("/api/checklists/5ef7acb26d80632ef40fe23b/items/5ef7acb76d80632ef40fe23d");
        expect(response.statusCode).toBe(404);
    });;
});