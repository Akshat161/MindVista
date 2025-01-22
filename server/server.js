import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config'
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid';  //generates random unique string 
import jwt from 'jsonwebtoken'
import cors from 'cors';
import { uploadOnCloudinary } from './utils/cloudinary.js';
import { upload } from './middleware/multer.middleware.js';
import verifyJWT from './middleware/verifyJWT.js';

// schemas below
import User from './Schema/User.js'
import Blog from './Schema/Blog.js'


const app = express();

let PORT = 5000;
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

app.post('/uploadImageInBlog', upload.single('file'), async (req, res) => {
    try {
        const imageLocalPath = req.file.path;
        const image = await uploadOnCloudinary(imageLocalPath);

        if (!image) {
            throw new Error(400, "Failed to upload image to Cloudinary");
        }
        
        res.status(200).json({ file: { url: image.url } }); 
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" });
    }
});
app.post(
    '/uploadBanner',
    upload.fields([{ name: 'banner', maxCount: 1 }]),
    async (req, res) => {
        try {
            const bannerLocalPath = req.files?.banner?.[0]?.path;

            if (!bannerLocalPath) {
                return res.status(400).json({ message: 'Banner is required' });
            }

            // Upload the banner to Cloudinary
            let banner;
            try {
                banner = await uploadOnCloudinary(bannerLocalPath);
            } catch (uploadError) {
                console.error('Error uploading to Cloudinary:', uploadError);
                return res
                    .status(500)
                    .json({ message: 'Failed to upload banner to Cloudinary' });
            }

            // Check if the upload was successful
            if (!banner) {
                console.error('No banner returned from Cloudinary upload.');
                return res
                    .status(500)
                    .json({ message: 'Failed to upload banner to Cloudinary' });
            }

            console.log('Banner uploaded:', banner.url);

            // Respond with the uploaded banner URL
            res.status(200).json({ banner: banner.url });
        } catch (error) {
            console.error('Error in /uploadBanner route:', error);
            res
                .status(error.statusCode || 500)
                .json({ message: error.message || 'Internal Server Error' });
        }
    }
);


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

app.post("/create-blog",verifyJWT,(req,res)=>{

    let authorId=req.user;

    let{ title,des,banner,tags,content,draft }=req.body;

    if(!title.length){
        return res.status(403).json({error:"You must provide a title to publish the blog"});

    }

    if(!draft)
        {

            if(!des.length || des.length>200){
                return res.status(403).json({error:"You must provide blog description under 200 characters"});
        
            }
            if(!banner.length){
                return res.status(403).json({error:"You must provide blog Banner to publish the blog"});
            }
            if(!content.blocks.length){
                return res.status(403).json({error:"You must provide Content to publish the blog"});
            }
            if(!tags.length || tags.length>10){
                return res.status(403).json({error:"You must provide tags to publish the blog"});
            }

        }

    tags=tags.map((tag)=>tag.toLowerCase());

    let blog_id=title.replace(/[^a-zA-Z0-9]/g,' ').replace(/\$+/g,"-").trim()+nanoid();

    let blog=new Blog({
        title, des,banner,content ,tags ,author:authorId, blog_id ,draft: Boolean(draft)
    })

    blog.save().then((blog)=>{

        let incrementval=draft ? 0 : 1;

        User.findOneAndUpdate({ _id: authorId},{$inc :{'account_info.total_posts':incrementval}, $push : {'blogs' :blog._id}})
        .then(user=>{
            return res.status(200).json({id:blog.blog_id})
        })
        .catch (err =>{
            return res.status(500).json({error:"Failed to update total posts number"})
        })
         
    })
    .catch(err=>{
        return res.status(500).json({error:err.message })
        
    })

    

})

app.post("/search-blogs",(req,res)=>{

    let {tag} =req.body;
    let {page}=req.body.page;
  
   
    let findQuery={ tags:tag , draft:false }

    let maxLimit=5;

    Blog.find(findQuery)
    .populate("author","personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({"publishedAt":-1})
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page-1)*maxLimit)
    .limit(maxLimit)
    .then((blogs)=>{
        return res.status(200).json({blogs})
    })
    .catch((err)=>{
        return res.status(500).json({error:err.message})
    })

})



app.post('/search-blogs-count',(req,res)=>{
    let{tag}=req.body;

    let findQuery ={tags:tag , draft :false}

    Blog.countDocuments(findQuery)
    .then(count =>{
        return res.status(200).json({totalDocs: count})
    })
    .catch(err =>{
        return res.status(500).json({error: err.message})
    })
})

app.post('/latest-blogs',(req,res)=>{

    let {page} =req.body;
    
    let maxLimit=5;

    Blog.find({draft:false})
    .populate("author","personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({"publishedAt":-1})
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page-1)*maxLimit)
    .limit(maxLimit)
    .then((blogs)=>{
        return res.status(200).json({blogs})
    })
    .catch((err)=>{
        return res.status(500).json({error:err.message})
    })

})

app.post('/all-latest-blogs-count',(req,res)=>{

    Blog.countDocuments({draft:false})
    .then(count=>{
        return res.status(200).json({totalDocs: count})
    })
    .catch(err=>{
        console.log(err.message)
        return res.status(500).json({error:err.message})
    })
})

app.get('/trending-blogs',(req,res)=>{

    Blog.find({draft:false})
    .populate("author","personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({"activity.total_read":-1,"activity.total_likes":-1,"publishedAt":-1})
    .select("blog_id title  publishedAt -_id")
    .limit(5)
    .then((blogs)=>{
        return res.status(200).json({blogs})
    })
    .catch((err)=>{
        return res.status(500).json({error:err.message})
    })
})


app.listen(PORT, () => {
    console.log('listening on port -> ' + PORT);
})
