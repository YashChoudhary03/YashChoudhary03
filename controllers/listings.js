const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const alllistings = await Listing.find({});
  res.render("listings/index.ejs", { alllistings });
};

module.exports.renderNewForm = (req, res) => {
  console.log(req.user);

  res.render("listings/newform.ejs");
};

module.exports.categoryListings = async (req, res) => {
  try {
    let { category } = req.query;
    console.log("Category Listings - Requested Category:", category); // Debug log
    
    let listingCategory = await Listing.find({ category: category });
    
    console.log("Category Listings:", listingCategory.length); // Debug log
    console.log("Category Listings Details:", listingCategory.map(l => l.category)); // Debug log
    
    res.render("listings/Catergory", { listingCategory });
  } catch (error) {
    console.error("Error in categoryListings method:", error);
    req.flash("error", "An error occurred while fetching category listings");
    res.redirect("/listings");
  }
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let categoryFilter = req.query.category; 
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }

  console.log(listing);
  let allListings = await Listing.find(
    categoryFilter ? { category: categoryFilter } : {}
  );
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
 let response= await geocodingClient.forwardGeocode({
    query:req.body.listing.location ,
    limit: 1
  })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;
  console.log(url, "..", filename);

  const newlisting = new Listing(req.body.listing);
  console.log(req.user);
  newlisting.owner = req.user._id;
  newlisting.image = { url, filename };
  newlisting.geometry=response.body.features[0].geometry;
  newlisting.category = req.body.listing.category;
  let savedLsiting=await newlisting.save();
  console.log(savedLsiting);
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
   return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  console.log(originalImageUrl);
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  listing.title = req.body.listing.title;
  listing.description = req.body.listing.description;
  listing.price = req.body.listing.price;
  listing.location = req.body.listing.location;
  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    
  }
  let updated=await listing.save();
  console.log(updated);
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", " Listing   Deleted!");
  res.redirect("/listings");
};
