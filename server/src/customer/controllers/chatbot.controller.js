const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const chatbotService = require("../services/chatbot.service");

const askChatbot = asyncHandler(async (req, res) => {
  const result = await chatbotService.askChatbot({
    userId: req.user.id,
    message: req.body.message,
    history: req.body.history || [],
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Chatbot response generated successfully", result));
});

module.exports = {
  askChatbot,
};
