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

    let content = {
        title: '',
        email: '',
        description: '',
        priority: '',
        imageUrl: '',
    }
    try {
        console.log('Connecting to the email server...');
        const connection = await imaps.connect(configs);
        await connection.openBox('INBOX');
        console.log('Connected to the email server and opened INBOX.');

        const searchCriteria = ['UNSEEN'];
        const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: true };

        const messages = await connection.search(searchCriteria,fetchOptions);
        console.log(`Found ${messages.length} unread emails.`); 

        for (const message of messages) { 
            let part =  await message.parts[1];
            let body  = part.body; 
            let email =  body.from[0].split(' ')[2].replace(/[<>]/gi, '');
            let subject = body.subject;
            let boundary = body['content-type'].split(' ')[1].split('=')[1];
            const sections = part.body.split(boundary);
            
            console.log(subject +' '+ email);  
            console.log(body);
            console.log('.........................');
            console.log(message);     


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


readEmails(); 

// module.exports = {readEmails} 