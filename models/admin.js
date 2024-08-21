import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const adminSchema = new mongoose.Schema({
    username: { type: String, required: [true, 'pls enter a username'], unique: [true, 'this username is not avialable']},
    password: { type: String, required: true }
});

adminSchema.pre('save', async function (next) {
    if (this.isModified('password') || this.isNew) {
        const salt = await bcrypt.genSalt();
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

adminSchema.statics.login = async function({username, password}){
    let admin = await this.findOne({username});

    console.log(admin);
    console.log({username, password});


    if(admin){
        if(password !== ''){
            let passCheck = await bcrypt.compare(password,admin.password)
            
            if(passCheck){
                return admin;
            }
                throw Error('incorrect password');
        }
            throw Error('password field is empty')
    }
    throw Error('invalid user');
}





const Admin = mongoose.model('aka', adminSchema);

export default Admin