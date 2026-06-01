const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `WhatsApp Management <${process.env.EMAIL_FROM}>`,
    to: email,
    subject,
    text: message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
