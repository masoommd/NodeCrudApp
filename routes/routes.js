const express = require('express');
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require('fs');

//image upload
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
})

let upload = multer({
    storage: storage,
}).single("image");

//Insert user tom the database
router.post("/add", upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
        });
        await user.save();
        req.session.message = {
            type: "success",
            message: "User added successfully!",
        };
        res.redirect("/");
    }
    catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

router.get('/', async (req, res) => {
    // User.find().exec((err, users) => {
    //     if (err) {
    //         res.json({ message: err.message });
    //     }
    //     else {
    //         res.render("index", { title: "Home Page", users: users });
    //     }
    // });

    try{
        const users =await User.find();
        res.render("index", { title: "Home Page", users: users });
    }
    catch(err){
        res.json({ message: err.message });
    }
});

router.get("/add", (req, res) => {
    res.render("add_user", { title: "Add User" });
});

router.get("/edit/:id",async (req,res) => {
    try {
        let {id} = req.params;
        const user = await User.findById(id);
        if(!user){
            res.json({ message: "User not found" });
            res.redirect("/");
        } else {
        res.render("edit_user",{title:"Edit User", user:user,});
        }
    } catch (err) {
        res.json({ message: err.message });
        return;
    }
});

// Update the existing User
router.put('/update/:id', upload, async (req,res) => {
    try {
    let {id} = req.params;
    let new_image='';

    if(req.file){
        new_image = req.file.filename;
        try{
            await fs.promises.unlink("./uploads/" + req.body.old_image);
        }
        catch(err){
            console.log(err);
        }
    }
    else{
        new_image = req.body.old_image;
    }
        const user = await User.findByIdAndUpdate(id, {
            name:req.body.name,
            email:req.body.email,
            phone:req.body.phone,
            image:new_image,
        });
        req.session.message = {
            type:'success',
            message:'User updated successfully'
        };
        res.redirect("/");
    } catch (err) {
        res.json({message:err.message, type:"danger"});
        res.redirect("/");
    }
});

//Delete User
router.get("/delete/:id", async(req,res) => {
    try {
    let {id} = req.params;
    const deleteUser  = await User.findByIdAndDelete(id);
    if(deleteUser.image !=''){
        try{
            await fs.promises.unlink("./uploads/" + deleteUser.image);
        }
        catch(err){
            console.log(err);
        }
    }
    req.session.message = {
        type: 'info',
        message: 'User deleted successfully',
    }
    res.redirect("/");
    } catch (err) {
        res.json({message:err.message});
    }
})

module.exports = router;