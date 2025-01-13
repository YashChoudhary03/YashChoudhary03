const Listing=require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");
const { listingSchema, reviewSchema } = require("./schema.js");
module.exports.isLoggedIn=(req,res,next)=>{
  console.log(req.path,"..",req.originalUrl);
  console.log(req.user);
  if(!req.isAuthenticated()){
     req.session.redirectUrl=req.originalUrl;
    //redirectUrl save
    req.flash("error","you must be logged in to create listing!");
   return res.redirect("/login");
  }
  next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
      res.locals.redirectUrl= req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner=async(req,res,next)=>{
  let { id } = req.params;
  let listing =await Listing.findById(id);
  if(!listing.owner._id.equals(res.locals.currUser._id)){
    req.flash("error","You are not the owner of this listing");
   return  res.redirect(`/listings/${id}`);
   }
   next();
}

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (!req.body.listing.image) {
    req.body.listing.image = {}; // Default to an empty object
  }
  

  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errmsg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errmsg);
  } else {
    next();
  }
};

module.exports.isReviewAuthor=async(req,res,next)=>{
  let { id,reviewId } = req.params;
  let review =await Review.findById(reviewId);
  if(!review.author.equals(res.locals.currUser._id)){
    req.flash("error","You are not the author of this review");
   return  res.redirect(`/listings/${id}`);
   }
   next();
}


module.exports.validateImage = (req, res, next) => {
  if (!req.body.listing.image.url) {
    req.body.listing.image.url =
      "https://plus.unsplash.com/premium_photo-1681255760839-6581e2eb3e96?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"; // Default link
  }
  next();
};