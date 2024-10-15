const nodemailer = require("nodemailer");
require('dotenv').config();

const sendEmail = async (email, subject, text) => {
    try {
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: email_username,
          pass: email_password,
        },
      });
  
      await transporter.sendMail({
        from: email_username,
        to: email,
        subject: subject,
        text: text,
      });
      //console.log("email sent sucessfully");
    } catch (error) {
      console.log("email not sent");
      console.log(error);
    }
  };
  
  module.exports = sendEmail;