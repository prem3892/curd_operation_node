import express from 'express';
const app =  express();
import  'dotenv/config';
const port = process.env.PORT || 4000 ;
// import cors from 'cors';
import path from 'path';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
// app.use(cors())l;
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
import multer from 'multer';


// db connection
const db =  async(str)=>{
try{
    if(str){
        const conn =  await mongoose.connect(str);
        if(conn){
           return console.log("connected to mongo DB")
        }
             
    }
}catch(e){
   return console.log("hello", e)
}
}
db(process.env.DB);

// model 
const createModel =  new mongoose.Schema({
    user: String,
    email: String,
    mobile: String,
    password: String,
    userProfile: String
})
;
const userModel =   mongoose.model("user", createModel);


// crud 
// create 

const publicPath =  path.join("public/");

const storeage =  multer.diskStorage({
    destination: (req, file, cb)=>{
        return cb(null, publicPath)
    },
    filename: (req, file, cb)=>{
        return cb(null, file.originalname);
    }
});

const userMulter =  multer({storage: storeage})

app.post("/create-user", userMulter.single("userProfile"), async(req, res)=>{
    const {user, email, mobile, password} =  req.body;
    const profile =  req.file;

    if(!profile)
        return res.status(400).json({message: "invalid profile field"});

        if(user && email && mobile && password){
            try{
                const userData =  new userModel({
                   user: user,
                   email: email,
                   mobile: mobile,
                   password: password,
                    userProfile: profile.filename
                });
                if(userData){
                    const saveUser =  await userData.save();
                    if(saveUser){
                        return res.status(201).json({message: "ok", data: saveUser})
                    }else{
                        return res.status(400).json("cannot save user")
                    }
                }else{
                    return res.status(400).json("user data not found")
                }
            
            }catch(e){
                throw new Error("server error", e)
            }
        }else{
            return res.status(404).json({message: "all fields are required"})
        }
}) 


// read data 

app.get("/users", async(req, res)=>{
    try{
        const getData = await userModel.find();
        if(!getData)
            return res.status(404).json({message: "data not found"});
        return res.status(200).json({message: getData})
    }catch(e){
        return res.status(500).json({message:e})
    }
})


// delete api
app.delete("/delete-user/:userid", async(req, res)=>{
    const {userid} =  req.params;

    if(!userid)
        return res.status(404).json({message: "user id not found"});

    try{
                const checkUserId =  await userModel.findById(userid);
                if(!checkUserId)
                    return res.status(301).json({message: "invalid user id"});

                const deleteUser =  await userModel.findByIdAndDelete(userid);
                if(!deleteUser)
                    return res.status(400).json({message: "cannot delete user"})
                    return res.status(200).json({message: "user deleted successfully", data: deleteUser});
                
    }catch(e){
        return res.status(500).json(e)
    }
}) 




app.listen(port, ()=>{
    console.log(`server running on http://localhost:${port}`)
})


