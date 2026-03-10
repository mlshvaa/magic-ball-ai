const aiService = require('./AiService');

class ChatController {
  static async askChat(req, res) {
    try {
      const { theme } = req.body;
      const response = await aiService.askChat(theme);
      console.log({ response });
      res.send(response);
    } catch (err) {
      res.status(500).json(err);
    }
  }
}

module.exports = ChatController;
