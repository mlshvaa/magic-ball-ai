const express = require('express');
const chatRouter = require('./src/aiResultsRouter');
const app = express();

app.use(express.json());
app.use('/api/magic', chatRouter);

module.exports = app;
