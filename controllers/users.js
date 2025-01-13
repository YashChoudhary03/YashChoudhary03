const User = require("../models/user.js");
module.exports.renderLoginForm=(req, res) => {
  res.render("users/login.ejs");
};
module.exports.renderSignupForm= (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup=async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
      if(err){
        return next(err);
      }
      req.flash("success", "welcome to Wanderlust");
      res.redirect("/listings");
    })
 
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.login=async(req, res) => {
  req.flash("success","welcome back to Wanderlust!,");
  let redirectUrl=res.locals.redirectUrl||"/listings";
  res.redirect(redirectUrl);
};

module.exports.logout=(req,res)=>{
  req.logout((err)=>{
     if(err){
      next(err);
     }
     req.flash("success","you are loggged out! ")
     res.redirect("/listings")
  });
};
