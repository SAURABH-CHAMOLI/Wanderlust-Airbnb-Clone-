const express=require("express");
const router=express.Router({mergeParams:true});  // to merge parent route with child route

const Listing=require('../models/listing.js');
const Review=require('../models/review.js')
const {listingSchema,reviewSchema}=require('../schema.js');
const wrapAsync=require('../utils/wrapAsync.js');
const ExpressError=require('../utils/ExpressError.js')

const {validateReview,isLoggedIn, isReviewAuthor}=require("../middleware.js")

//Reviews Post route
router.post('/',
    isLoggedIn,
    validateReview,
    wrapAsync(async(req,res)=>{
    
    let listing=await Listing.findById(req.params.id);
    console.log(listing)
    let newReview=new Review(req.body.review);
    newReview.author=req.user._id;
    console.log(newReview)
    console.log(newReview)

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash('success','New Review Created!')
    res.redirect(`/listings/${listing._id}`)
}))

//Reviews Delete Route
router.delete('/:reviewId',
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(async(req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Review Deleted!')
    res.redirect(`/listings/${id}`)
}))

module.exports=router;
