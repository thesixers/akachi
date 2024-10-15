import express from 'express';
import { connect } from 'mongoose';
import cookieParser from 'cookie-parser';
import path from 'path';
import { config } from 'dotenv';
import morgan from 'morgan';
import Admin from './models/admin.js';
import fileuploader from 'express-fileupload';
import { readEmails } from './middleware/emailChecker.js';
import gx from 'genesix';
import auth from './routes/auth.js';
import Complaint from './routes/complaint.js';

const app= express();

// Load environment variables
config();

const {PORT, MONGO_URI} = process.env

const port = PORT || 3000; 

// MongoDB Connection
connect(MONGO_URI)
.then(() => {
    console.log('MongoDB connected');
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}).catch(err => {
    console.log('MongoDB connection error: ', err.message);
});

// Middleware
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(fileuploader({useTempFiles: true}));

// Routes
app.get('/', (req,res)=>{
    res.redirect('/icrs');
});

app.use('/icrs', auth);
app.use('/complaint', Complaint);
