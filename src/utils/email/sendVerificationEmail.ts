import sendEmail from "./sendEmail";

interface Params {
  name: string;
  email: string;
  verificationToken: string;
  origin: string;
}

const sendVerificationEmail = async ({
  name,
  email,
  verificationToken,
  origin,
}: Params) => {
  const verifyEmail = `${origin}/auth/confirmation?token=${verificationToken}&email=${email}`;

  const message = `<p>Please confirm your email by clicking on the following link : 
  <a href="${verifyEmail}">Verify Email</a> </p>`;

  return sendEmail({
    to: email,
    subject: "Email Confirmation",
    html: `<h4> Hello, ${name}</h4>
    ${message}
    `,
  });
};

export default sendVerificationEmail;
