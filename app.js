require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');

const app = express();
const PORT = 8080;

//mongo connection
// const MONGO_URL = "mongodb://127.0.0.1:27017/node_crud";
// main().then(()=>{
//     console.log("Successful connect to database ")
// })
// .catch((err) => {
//     console.log(err);
// });
// async function main(){
//     await mongoose.connect(MONGO_URL);
// }

mongoose.connect(process.env.db_Url);
const db = mongoose.connection;
db.on('error',(err)=> console.log(err));
db.once('open',()=>console.log("Connected to database"));

//middleware
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use(methodOverride("_method"));

const sessionOption = {
    secret:"mysecretkey",
    saveUninitialized:true,
    resave:false,
}
app.use(session(sessionOption));

app.use((req,res,next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})

///set template engine
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.static('uploads'));


// for layout we install ejs-mate
app.engine('ejs',ejsMate);
//route prefix
const userRouter = require("./routes/routes");
app.use("/",userRouter);


app.get("/",(req,res)=>{
    res.send("HI!");
})

app.listen(PORT,()=>{
    console.log(`Server started at http://localhost:${PORT}`);
})