const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const process = require('process');
const path = require('path');

const app = express();

const API_ROUTE = '/api/checklists';
const DB_URL = process.env.DB_URL;

// Database
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to database"))
  .catch(err => console.log(err));

// Make Mongoose use `findOneAndUpdate()`.
mongoose.set('useFindAndModify', false);

// Middleware (CORS allowed)
app.options('*', cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(express.static("public"));

// React routes
app.get(['/view', '/view/*', '/create', '/about'], function (req, res, next) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Controllers
const checklistController = require('./controllers/checklistController');

// Routes
app.post(API_ROUTE, checklistController.create);
app.post(`${API_ROUTE}/:id/items`, checklistController.addItem);
app.put(`${API_ROUTE}/:id`, checklistController.update);
app.put(`${API_ROUTE}/:id/items/:itemId`, checklistController.updateItem);
app.get(`${API_ROUTE}/:id`, checklistController.retrieve);
app.delete(`${API_ROUTE}/:id`, checklistController.delete);
app.delete(`${API_ROUTE}/:id/items/:itemId`, checklistController.deleteItem);

module.exports = app;
