const { Resend } = require("resend");
const ApiError = require("../../utils/apiError");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendContactMessage = async ({ name, email, message }) => {
  if (!process.env.RESEND_API_KEY) {
    throw new ApiError(500, "Resend API key missing");
  }

  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Rovauto <onboarding@resend.dev>",
    to: process.env.CONTACT_INBOX || "rovauto.offical@gmail.com",
    replyTo: email,
    subject: `New Rovauto Contact Message from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br/>")}</p>
      </div>
    `,
  });

  if (result.error) {
    throw new ApiError(500, result.error.message || "Failed to send message");
  }

  return {
    sent: true,
  };
};

module.exports = {
  sendContactMessage,
};
