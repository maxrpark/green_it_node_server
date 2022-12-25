import sendEmail from "./sendEmail";

interface Params {
  name: string;
  email: string;
  verificationToken: string;
  origin: string;
}

const sendResetPasswordEmail = async ({
  name,
  email,
  verificationToken,
  origin,
}: Params) => {
  const verifyEmail = `${origin}/auth/reset-password?token=${verificationToken}&email=${email}`;

  const message = `<p>Please reset your email by clicking on the following link : 
  <a href="${verifyEmail}">Verify Email</a> </p>`;

  return sendEmail({
    to: email,
    subject: "Reset email",
    html: `<h4> Hello, ${name}</h4>
    ${message}
    <h3> If you did not requested to reset your password please ignore this email.</h3>
    `,
  });
};

export default sendResetPasswordEmail;
