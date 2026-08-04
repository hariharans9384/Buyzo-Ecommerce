const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html, fromName = 'Dudez_Shop' }) => {
  try {
    const emailUser = process.env.EMAIL || process.env.SMTP_EMAIL;
    const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASSWORD;

    // If SMTP credentials are provided in .env, use them to actually send an email
    if (emailUser && emailPass) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      const mailOptions = {
        from: `"Dudez_Shop" <${emailUser}>`,
        to,
        subject,
        text,
        html,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email successfully sent to ${to}`);
      return true;
    } else {
      // Fallback: Just print to the console if no email credentials are set up
      console.log('==============================================');
      console.log('EMAIL SIMULATION (No SMTP credentials found):');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Text: ${text}`);
      console.log('==============================================');
      return true;
    }
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
    return false; // Email failed
  }
};

module.exports = sendEmail;
