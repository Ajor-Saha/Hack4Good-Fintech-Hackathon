import nodemailer from 'nodemailer'

export async function sendVerificationEmail(email: string, username: string, verifyCode: string) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // e.g., Gmail, Outlook
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // your email password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER, // sender address
      to: email, // list of receivers
      subject: 'Account Verification Code', // Subject line
      text: `Hello ${username},\n\nYour verification code is: ${verifyCode}\n\nPlease use this code to verify your account.`, // plain text body
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: `Email sent: ${info.response}`,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      message: "Failed to send verification email",
    };
  }
}