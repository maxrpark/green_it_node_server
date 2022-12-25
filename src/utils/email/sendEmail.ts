import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
dotenv.config();

interface sendEmailParams {
  to: string;
  subject: string;
  html: string;
}

const sendEmail = async ({ to, subject, html }: sendEmailParams) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

  const msg = {
    from: '"Green it" <proyectoindit@gmail.com>', // sender address
    to,
    subject,
    html,
  };

  const info = await sgMail.send(msg);
  return info;
};

export default sendEmail;

// const sendEmail = async ({ to, subject, html }: sendEmailParams) => {
//   let testAccount = await nodemailer.createTestAccount();

//   const transporter = nodemailer.createTransport(nodemailerConfig);

//   return transporter.sendMail({
//     from: '"Green it" <greenit@gmail.com>', // sender address
//     to,
//     subject,
//     html,
//   });
// };
