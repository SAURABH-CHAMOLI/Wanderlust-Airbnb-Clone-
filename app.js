// to access env variables stored in .env file
if(process.env.NODE_ENV!='production') {
    require("dotenv").config();
}


const express=require('express');
const app=express();

const nodemon=require('nodemon');
const mongoose=require('mongoose');
const path=require('path')
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));
app.use(express.static(path.join(__dirname,'/public')))
app.use('/public', express.static('public'));
app.use(express.urlencoded({extended:true}))
const methodOverride=require("method-override");
app.use(methodOverride("_method"));
const ejsMate=require("ejs-mate")
app.engine('ejs',ejsMate)

const session=require('express-session');
const MongoStore=require('connect-mongo')
const flash=require('connect-flash');

const passport=require("passport");
const localStratergy=require("passport-local");
const User=require("./models/user.js");

const Listing=require('./models/listing.js')
const Review=require('./models/review.js')
const wrapAsync=require('./utils/wrapAsync.js')
const {listingSchema,reviewSchema}=require('./schema.js');  // Joi (Server Side Validation) 
const ExpressError=require('./utils/ExpressError.js')

// Express Router
const listingRouter=require("./routes/listing.js")
const reviewRouter=require("./routes/review.js")
const userRouter=require("./routes/user.js")

const port=3000;
const dbUrl=process.env.ATLASDB_URL;

main()
.then(()=>{
    console.log("connection successful")
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}


// MongoDB session
const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
})

store.on("error",(err)=>{
    console.log("ERROR in MONGO SESSION STORE",err);
})

// Express Session
const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true
    }
};

app.use(session(sessionOptions));
app.use(flash());

//Passport
app.use(passport.initialize());  //middleware to initialize passport
app.use(passport.session());     //to check for every session same user is sending req
passport.use(new localStratergy(User.authenticate()));  // to allow/check user to sign-in/sign-up

passport.serializeUser(User.serializeUser());    // to store that user is log-in in session/local-storage
passport.deserializeUser(User.deserializeUser());  // to remove from session/local-storage after user has logged-out

app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    res.locals.currUser=req.user;
    next();
})


app.use("/listings",listingRouter)   // Express Router
app.use("/listings/:id/reviews",reviewRouter)
app.use("/",userRouter)

app.get("/",(req,res)=>{
    res.redirect('/listings')
})


app.all('*',(req,res,next)=>{
    next(new ExpressError(404,'Page Not Found!'))
})

app.use((err,req,res,next)=>{
    let {status=500,message='Something Went Wrong'}=err
    res.render('listings/error.ejs',{message})
})

app.listen(port,(req,res)=>{
    console.log(`Server is listening to port : ${port}`)
})
