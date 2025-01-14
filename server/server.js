import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config'
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'; //generates random unique string 
import jwt from 'jsonwebtoken'
import cors from 'cors';

// schemas below
import User from './Schema/User.js'


const app = express();

let PORT = 3000;
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

app.use(express.json());
app.use(cors()); //enables server to accept data from anywhere 

mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true
})

const formatDatatoSend = (user) => {

    const access_token = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY)

    return {

        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    }

}

const generateUsername = async (email) => {

    let username = email.split("@")[0];

    let isUsernameNotUnique = await User.exists({ "personal_info.username": username }).then((result) => result);
    isUsernameNotUnique ? username += nanoid().substring(0, 5) : "";

    return username

}

app.post("/signup", (req, res) => {

    const { fullname, email, password } = req.body;

    //validating the data from frontend

    if (!fullname.length) {
        return res.status(403).json({ "error": "Enter Full Name" })
    }

    if (!email.length) {
        return res.status(403).json({ "error": "Enter Email" })
    }
    if (!emailRegex.test(email)) {
        return res.status(403).json({ "error": "email is invalid" })
    }
    if (!password.length) {
        return res.status(403).json({ "error": "Enter Password" })
    }
    if (!passwordRegex.test(password)) {
        return res.status(403).json({ "error": "password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters " })
    }
    bcrypt.hash(password, 10, async (err, hashed_password) => {

        let username = await generateUsername(email);

        let user = new User(
            {
                personal_info: { fullname, email, password: hashed_password, username }
            })

        user.save().then((u) => {
            return res.status(200).json(formatDatatoSend(u))
        })
            .catch(err => {
                if (err.code == 11000) {
                    return res.status(500).json({ "error": "Email Already Exists" })
                }
                return res.status(500).json({ "error": err.message })
            })


    })

})

app.post("/signin", (req, res) => {

    let { email, password } = req.body;
    User.findOne({ 'personal_info.email': email })
    .then((user)=>{
        if(!user){ 
            return res.status(403).json({"error":"Email not found"})
        }
    bcrypt.compare(password,user.personal_info.password,(err,result)=>{
        if(err){
            return res.status(403).json({"error":"Error occured while login olease try again"})
        }

        if(!result){
            return res.status(403).json({"error":"Incorrect  Password"})
        }
        else{
            return res.status(200).json(formatDatatoSend(user))
        }
    })
        

    })
    .catch((err)=>{
        console.log(err.message);
        return res.status(500).json({"error":err.message})
    })
})



app.listen(PORT, () => {
    console.log('listening on port -> ' + PORT);
})