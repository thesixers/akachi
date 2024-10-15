import imaps from 'imap-simple';
import { config } from 'dotenv';
import Complaint from '../models/complaint.js';
import { json } from 'express';
import { sendEmails } from './formError.js';

config();
const {EMAIL_PASS, EMAIL_USER} = process.env

const configs = {
    imap: {
        user: EMAIL_USER,
        password: EMAIL_PASS,
        host: 'imap.gmail.com',
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
        console.log('Connecting to the email server...');
        const connection = await imaps.connect(configs);
        await connection.openBox('INBOX');
        console.log('Connected to the email server and opened INBOX.');

        const searchCriteria = ['UNSEEN'];
        const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: true };

        const messages = await connection.search(searchCriteria,fetchOptions);

        for (const message of messages) { 
            let part =  await message.parts[1];
            let body  = part.body; 
            let title = body.subject ? body.subject[0] : '';
            let T = typeof title === 'string'? title : JSON.stringify(title);
            

            if(T.toLowerCase().includes('complain') || T.toLowerCase().includes('complaint')){
                let email =  body.from[0].split(' ')[2].replace(/[<>]/gi, '');
                let boundary = body['content-type'][0].split(' ')[1].split('=')[1].replace(/["]/gi,'')  
                const sections = message.parts[0].body.split(boundary);   
                let description =  sections.map(section => {
                    const textMatch = section.match(/Content-Type: text\/plain; charset="UTF-8"\r\n\r\n([\s\S]*?)\r\n\r\n/);
                    return textMatch ? textMatch[1] : null;
                });  

                let uploadComplaint = await Complaint.create({
                    title: title,
                    email: email,
                    description: description[1]
                });

                await sendEmails('received',uploadComplaint);
            }
                 


        }       
    } catch (error) {
        console.error('Error reading emails:', error);  
    }
};


setInterval(() => {
    readEmails(); 
}, 50000);

// module.exports = {readEmails} 