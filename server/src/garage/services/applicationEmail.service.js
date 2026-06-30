const { Resend } = require("resend");

let resend;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

const sendGarageApplicationEmail = async ({ to, subject, message }) => {
  if (!to) return false;

  if (!resend || !process.env.EMAIL_FROM) {
    if (process.env.NODE_ENV !== "production") {
      console.log("=================================");
      console.log("ROVAUTO GARAGE APPLICATION EMAIL");
      console.log("To:", to);
      console.log("Subject:", subject);
      console.log("Message:", message);
      console.log("=================================");
    }
    return false;
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html: `
      <h2>${subject}</h2>
      <p>${message}</p>
      <p>Team Rovauto</p>
    `,
  });

  return true;
};

module.exports = {
  sendGarageApplicationEmail,
};
