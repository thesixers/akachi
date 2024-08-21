import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.js';
import Complaint from '../models/complaint.js';
import { handleError, createJwt, checkLogin } from '../middleware/formError.js';
const router = Router();

const maxAge = 1 * 24 * 60 * 60;

// Admin Dashboard
router.get('/', (req,res) => {
    res.redirect('/icrs/login');
});
// Admin Login get
router.get('/login', (req, res) => {
    res.render('index', { title: 'Admin Login' });
});


router.get('/dashboard', checkLogin, async (req, res) => {
    const complaints = await Complaint.find();
    res.render('admin-dashboard', { title: 'Admin Dashboard', complaints });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
   try{

    let admin = await Admin.login({username, password});

    if(admin){

        let token = createJwt(admin._id);

        res.cookie('icrsAdmin', token, {httpOnly: true, maxAge: maxAge * 1000});
        res.json({
            M: 'Login successful'
        })
    }
   } catch (error) {
        let result = handleError(error);
        res.status(400).json(result);
        console.log(result);
    }
});

// Register Admin
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    console.log({username, password});
    
    create({username, password})
    .then(result =>{
        console.log(result);
        res.json({
            M: 'admin created'
        })

    })
    .catch((err)=>{
        res.json({
            E: 'error admin not created'
        })
    })
});

router.get('/logout', (req, res) => {
    res.cookie('icrsAdmin', '', {httpOnly: true, maxAge: 1});
    res.redirect('/');
});


export default router;