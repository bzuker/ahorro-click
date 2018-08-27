const nodemailer = require('nodemailer');
// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport(`smtps://${process.env.SMTP_LOGIN}:${process.env.SMTP_PASSW}@smtp.mailgun.org`);

const sendEmail = async message => {
  // setup e-mail data
  const mailOptions = {
      from: 'Ahorro Click', // sender address
      to: process.env.TEST_RECIPIENT, // list of receivers
      subject: 'Se cayó el access token', // Subject line
      text: message, // plaintext body
      html: `<b>${message}</b>` // html body
  };

  // send mail with defined transport object
  try {
    transporter.sendMail(mailOptions, (error, info) => {
        if(error){
            return console.log(error);
        }
        console.log('Mail sent: ' + info.response);
    });
  } 
  catch(error) {
    console.error('Could not send email');
  }
};

module.exports = sendEmail