const express=require("express");
const router=express.Router();

const Listing=require('../models/listing.js');
const Review=require('../models/review.js')
const wrapAsync=require('../utils/wrapAsync.js');
const {validateListing,isLoggedIn,isOwner}=require('../middleware.js')

const multer=require('multer');
const {storage}=require('../cloudConfig.js');
const upload=multer({storage})

//Index Route
router.get('/',wrapAsync(async (req,res)=>{
    const allListings=await Listing.find({}); 
    res.render('listings/index.ejs',{allListings})
}))

//New Route
router.get('/new',isLoggedIn,(req,res)=>{
    res.render('listings/new.ejs');
})

//Show Route
router.get('/:id',wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id)
        .populate({path:"reviews",
            populate:{
                path:"author",
            },
        })
        .populate("owner")
    res.render('listings/show.ejs',{listing})
}))

//Create Route
router.post('/',
    isLoggedIn,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(async(req,res)=>{
    let url=req.file.path;
    let filename=req.file.filename;
    let listing=req.body.listing;
    let newListing=new Listing(listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    await newListing.save();
    req.flash('success','New Listing Created!')
    res.redirect('/listings')
}))

//Edit Route
router.get('/:id/edit',
    isLoggedIn,
    isOwner,
    wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id)
    res.render('listings/edit.ejs',{listing})
}))

//Update Route
router.put('/:id',
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(async(req,res)=>{
    
    let {id}=req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing})
    if(typeof req.file !=="undefined") {
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
    }

    req.flash('success','Listing Updated!')
    res.redirect(`/listings/${id}`)
})
)

//Delete Route
router.delete('/:id/delete',
    isLoggedIn,
    isOwner,
    wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    await Review.deleteMany({_id:{$in:listing.reviews}})
    let deletedListing=await Listing.findByIdAndDelete(id)
    console.log(deletedListing)
    req.flash('success','Listing Deleted!')
    res.redirect('/listings')
}))

module.exports=router;