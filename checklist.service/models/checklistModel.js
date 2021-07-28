const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/** 
 * Model that represents a list item.
 */
const ListItemSchema = new Schema({
    checked: Boolean,
    data: String
});

/**
 * Model that represents a checklist.
 */
const ChecklistSchema = new Schema({
    title: String,
    description: String,
    lastUpdated: Date,
    listItems: [ListItemSchema]
});

module.exports = mongoose.model('checklist', ChecklistSchema);
