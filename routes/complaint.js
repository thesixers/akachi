import express from 'express';
const router = express.Router();
import Complaint from '../models/complaint.js';
import nodemailer from 'nodemailer';
import gx from 'genesix';
import { uploadImage } from '../middleware/formError.js';

router.get('/', (req,res)=>{
    res.redirect('/complaint/form')
})

// Complaint Form
router.get('/form', (req, res) => {
    res.render('complaint-form', { title: 'Submit a Complaint' });
});

// Handle Complaint Submission
router.post('/submit', async (req, res) => {
    const { title, email, description, priority } = req.body;
    let imageUrl;

    if(req.files){
        if(req.files.image){
            imageUrl = await uploadImage(req.files.image.tempFilePath);
        }
    }

    try {
        const newComplaint = new Complaint({
            title,
            email,
            description,
            priority,
            imageUrl,
        });

        await newComplaint.save();
        res.json({
            M: 'complain submited'
        })
    } catch (error) {
        res.status(400).json({
            E: 'Error in submitting complaint try again'
        });
    }
});

router.post('/resolve/:id', async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({
            E: 'Complaint not found'
        });

        complaint.resolved = 'true';
        await complaint.save();

        // Send an email to the user
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: complaint.email,
            subject: 'Complaint Resolved',
            text: `Dear User, your complaint titled "${complaint.title}" has been resolved. Thank you for your patience.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});


export default router
