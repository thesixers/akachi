import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import Complaint from '../models/complaint.js';

config();
const {EMAIL_PASS, EMAIL_USER} = process.env

// console.log({EMAIL_PASS, EMAIL_USER});

const configs = {
    imap: {
        user: EMAIL_USER,
        password: EMAIL_PASS,
        host: 'imap.gmail.com', // Replace with your email provider's IMAP server
        port: 993,
        tls: true,
        tlsOptions: {
            rejectUnauthorized: false
        },
        authTimeout: 10000,
    },
};


export const readEmails = async () => {
    try {
        // Connect to the email server
        const connection = await imaps.connect(configs);
        await connection.openBox('INBOX');

        // Search for unread emails
        const searchCriteria = ['UNSEEN'];
        const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: true };

        // Fetch emails
        const messages = await connection.search(searchCriteria, fetchOptions);

        for (const message of messages) {
            const all = message.parts.find(part => part.which === 'TEXT');
            const parsed = await simpleParser(all.body);

            const { subject, from, text, attachments } = parsed;
            const email = from.value[0].address;
            const title = subject || 'No Subject';
            const description = text || 'No Description';

            // Handle attachment if needed
            let imageUrl = null;
            if (attachments.length > 0) {
                const attachment = attachments[0];
                // Save the attachment if necessary and get its URL
                // For demonstration, we're using attachment.filename directly
                imageUrl = attachment.filename;
                console.log(attachment);
            }

            // Create a new complaint entry in the database
            const complaint = new Complaint({
                title,
                email,
                description,
                priority: 'Normal', // Default priority
                imageUrl,
            });

            await complaint.save();
            console.log('Complaint saved:', complaint);

            // Optionally, send a confirmation email
            sendConfirmationEmail(email, title);
        }
    } catch (error) {
        console.error('Error reading emails:', error);
    }
};

// Function to send a confirmation email
// const sendConfirmationEmail = (userEmail, complaintTitle) => {
//     const nodemailer = require('nodemailer');

//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: 'your-email@gmail.com',
//             pass: 'your-email-password',
//         },
//     });

//     const mailOptions = {
//         from: 'no-reply@yourdomain.com',
//         to: userEmail,
//         subject: 'Complaint Received',
//         text: `Dear user,\n\nYour complaint titled "${complaintTitle}" has been received and is being processed.\n\nBest regards,\nSupport Team`,
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.log('Error sending confirmation email:', error);
//         } else {
//             console.log('Confirmation email sent:', info.response);
//         }
//     });
// };

// Run the email reading function periodically
// const cron = require('node-cron');
// cron.schedule('*/5 * * * *', () => {
//     readEmails();
// });


// readEmails();

// module.exports = {readEmails}