import express from 'express';
const router = express.Router();
import Complaint from '../models/complaint.js';
import nodemailer from 'nodemailer';
import gx from 'genesix';
import { sendEmails, uploadImage } from '../middleware/formError.js';

router.get('/', (req,res)=>{
    res.redirect('/complaint/form')
})

// Complaint Form
router.get('/form', (req, res) => {
    res.render('complaint-form', { title: 'Submit a Complaint' });
});

router.post('/resolved', async (req, res) => {
    const {id} = req.body;
    try {
        let complaint = await Complaint.findById(id);
        complaint.resolved = 'true';
        await complaint.save();

        await sendEmails('resolve', complaint);

        res.status(200).json({M: 'resolved'});
    } catch (err) {
        console.log(err);
        res.status(500).json({E: 'not resolved'});
    }
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


export default router
