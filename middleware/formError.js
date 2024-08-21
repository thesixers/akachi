import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
config();
import { v2 as cloudinary } from 'cloudinary';

let secret = process.env.CLOUDINARY_SECRET;
let api_key = process.env.CLOUDINARY_API_KEY;
let id = process.env.CLOUDINARY_ID;



export const uploadImage =  async(image) =>{

    // Configuration
    cloudinary.config({ 
        cloud_name: id, 
        api_key: api_key, 
        api_secret: secret // Click 'View Credentials' below to copy your API secret
    });
    
    // Upload an image
     const uploadResult = await cloudinary.uploader
       .upload(
            image,
            { folder: 'gx-users' }
       )
       .catch((error) => {
           console.log(error);
           return error;
       });
    
    
       let it = uploadResult.secure_url;
    
    // Optimize delivery by resizing and applying auto-format and auto-quality
    const optimizeUrl = cloudinary.url(it, {
        fetch_format: 'auto',
        quality: 'auto'
    });
    
    return optimizeUrl; 

}

export const handleError = (err) =>{
    const errors = {user: '', password: ''};

    if(err.message === 'invalid user'){
        errors.user = 'invalid user'
    }

    if(err.message === 'passwaord field is empty'){
        errors.password = 'passwaord field is empty';
    }

    if(err.message === 'incorrect password'){
        errors.password = 'incorrect password'
    }

    return errors
};

export const createJwt = (id) =>{
    console.log(id);
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: 1 * 24 * 60 * 60})
}


export const checkLogin = (req,res,next) =>{

    let token = req.cookies.icrsAdmin;

    if(token){
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedtoken) =>{
            if(err){
                res.redirect('/icrs/login');
            }else{
                next()
            }
        })

    }else{
        res.redirect('/icrs/login')
    }

}

