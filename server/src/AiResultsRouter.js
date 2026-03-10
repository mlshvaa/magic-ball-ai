const express = require('express');
const ChatController = require('./AiResultsController');
const chatRouter = express.Router();

chatRouter.post('/ask', ChatController.askChat);

module.exports = chatRouter;
