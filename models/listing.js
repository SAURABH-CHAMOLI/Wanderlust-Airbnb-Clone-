const mongoose=require('mongoose');

const listingSchema=mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
       type: String
    },
    image:{
        url:String,
        filename:String
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Review"
        },
    ],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
})

const Listing=mongoose.model("Listing",listingSchema);

module.exports=Listing;