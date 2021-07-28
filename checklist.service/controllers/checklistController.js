const ChecklistModel = require('../models/checklistModel');

module.exports = {
    /**
     * Create a new checklist.
     */
    create: async (req, res) => {
        let checklist = new ChecklistModel({
            title: req.body.title,
            description: req.body.description,
            lastUpdated: Date.now(),
            listItems: req.body.listItems
        });

        try {
            const result = await checklist.save();
            return res.json(result);
        } catch (err) {
            console.log(err);
            return res.status(500).send("Failed to save the checklist.");
        }
    },

    /**
     * Update an existing checklist
     */
    update: async (req, res) => {
        try {
            const checklistInput = { ...req.body, lastUpdated: Date.now() }
            const checklist = await ChecklistModel.findOneAndUpdate({ _id: req.params.id }, checklistInput, { new: true });
            if (!checklist) {
                return res.status(404).send("No such checklist exists.");
            }

            return res.json(checklist);
        } catch (err) {
            console.log(err);
            return res.status(500).send("Failed to update the checklist.");
        }
    },

    /**
     * Retrieve an checklist by id
     */
    retrieve: async (req, res) => {
        try {
            const checklist = await ChecklistModel.findById(req.params.id);
            if (!checklist) {
                return res.status(404).send("No such checklist exists.");
            }

            return res.json(checklist);
        } catch (err) {
            console.log(err);
            return res.status(500).send("Failed to fetch the checklist.");
        }
    },

    /**
     * Delete a checklist by id
     */
    delete: async (req, res) => {
        try {
            await ChecklistModel.deleteOne({ _id: req.params.id });
            return res.status(204).send();
        } catch (err) {
            console.log(err);
            return res.status(500).send("Failed to delete the checklist.");
        }
    },

    /**
     * Add an item to a checklist
     */
    addItem: async (req, res) => {
        try {
            let checklist = await ChecklistModel.findById(req.params.id);
            if (!checklist) {
                return res.status(404).send("No such checklist exists.");
            }

            checklist.listItems.push(req.body);
            checklist.lastUpdated = Date.now();
            checklist = await checklist.save();
            return res.json(checklist.listItems.slice(-1)[0]);
        } catch (err) {
            console.log(err);
            return res.status(500).send("Failed to add the checklist item.");
        }
    },

    /**
     * Update an item in a checklist
     */
    updateItem: async (req, res) => {
        try {
            const checklistItemInput = { "$set": { "listItems.$": { ...req.body, _id: req.params.itemId } }, lastUpdated: Date.now() }
            const checklist = await ChecklistModel.findOneAndUpdate({ _id: req.params.id, "listItems._id": req.params.itemId }, checklistItemInput, { new: true });
            if (!checklist) {
                return res.status(404).send("No such checklist item exists.");
            }

            return res.json(checklist.listItems.id(req.params.itemId));
        } catch (err) {
            console.log(err);
            return res.status(500).send("Failed to update the checklist item.");
        }
    },

    /**
     * Delete an item from a checklist
     */
    deleteItem: async (req, res) => {
        try {
            let checklist = await ChecklistModel.findById(req.params.id);
            if (!checklist) {
                return res.status(404).send("No such checklist exists.");
            }

            const item = checklist.listItems.id(req.params.itemId);
            if (item) {
                item.remove();
                checklist.lastUpdated = Date.now();
                checklist = await checklist.save();
            }
            return res.status(204).send();
        } catch (err) {
            console.log(err);
            return res.status(500).send("Failed to delete the checklist item.");
        }
    }
}