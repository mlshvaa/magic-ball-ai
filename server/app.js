const express = require('express');
const chatRouter = require('./src/AiResultsRouter');
const app = express();
const cors = require('cors')

app.use(express.json());
app.use(cors())
app.use('/api/magic', chatRouter);

module.exports = app;
