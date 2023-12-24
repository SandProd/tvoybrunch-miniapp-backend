const nodemailer = require('nodemailer');

// Create a transporter object for sending emails
const transporter = nodemailer.createTransport({
    host: 'mail.adm.tools',
    port: 25,  // Use port 25 for SMTP
    secure: false,  // Set to false, as it's a port without SSL
    auth: {
        user: 'orders@tvoybranch-backend.space', // Your email address
        pass: 'u55G3f5iCE' // Your email password
    }
});

// Function for sending emails
const sendEmail = (recipientEmail, subject, text, callback) => {
    const mailOptions = {
        from: 'orders@tvoybranch-backend.space',
        to: recipientEmail,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            logger.error('Ошибка отправки письма:', error);
            callback(error, info);
        } else {
            logger.info('Письмо отправлено:', info.response);
            callback(null, info);
        }
    });
};

module.exports = { transporter, sendEmail };
