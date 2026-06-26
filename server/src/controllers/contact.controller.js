const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const contactService = require("../services/contact.service");

const sendContactMessage = asyncHandler(async (req, res) => {
  const result = await contactService.sendContactMessage(req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, "Message sent successfully", result));
});

module.exports = {
  sendContactMessage,
};