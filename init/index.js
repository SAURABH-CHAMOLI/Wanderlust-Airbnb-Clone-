const mongoose=require('mongoose');
const initData=require('./data')

const Listing=require('../models/listing')

main()
.then(()=>{
    console.log("connection successful")
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

async function initDB() {
  await Listing.deleteMany({});
  initData.data=initData.data.map((obj)=>({
    ...obj,
    owner:"671cee1ef6432e3c4362cc08",
  }));
  await Listing.insertMany(initData.data);
  console.log("Data was initialzed");
}

initDB();