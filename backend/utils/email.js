import nodemailer from 'nodemailer';

export default class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
    this.from = `Motamyezon Admin <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    /*
    if (process.env.NODE_ENV === 'production') {
      // SendGrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    */

    // Development (Mailtrap)
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual text email
  async send(textMessage, subject) {
    // 1) Define simple plain-text email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: textMessage,
    };

    // 2) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    const message = `Hi ${this.firstName},\n\nWelcome to the Motamyezon Family! We are glad to have you on board.\n\nBest regards,\nMotamyezon Team`;
    await this.send(message, 'Welcome to the Motamyezon Family!');
  }

  async sendPasswordReset() {
    const message = `Hi ${this.firstName},\n\nForgot your password? Click the link below or paste it into your API client to reset your password:\n${this.url}\n\nThis link is only valid for 10 minutes. If you did not make this request, please ignore this email.`;
    await this.send(
      message,
      'Your password reset token (valid for only 10 minutes)',
    );
  }
}
