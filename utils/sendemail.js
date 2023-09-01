import nodemailer from "nodemailer";
const sendemail = async (email, subject, message) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAILHOST,
    port: process.env.EMAILPORT,
    auth: {
      user: process.env.EMAILUSER,
      pass: process.env.EMAILPASSWORD,
    },
  });
  await transport.sendMail({
    from: "temfordsa@gmail.com",
    to: email,
    subject: subject,
    html: message,
  });
};

export default sendemail;
