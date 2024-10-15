const path = require('path');
const mongoose = require ('mongoose');
const jwt = require('jsonwebtoken');
const sendEmail = require("../utils/email");
const ExpressError = require('../utils/ExpressError');
const user =  require('../models/users');
const Token = require("../models/token");
const crypto = require('crypto');
const fs = require('fs').promises;


mongoose.connect(DB_HOST, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
        console.log("Connection open");
    })
    .catch(err => {
        console.log("Error: ");
        console.log(err);
    });

// change the below into utils and add all validations
function validate(body) {
  if (!body.email || !body.password) return false;
  if (body.password=="") return false;   // test with an empty password to see if we need this line
  return true;
};

const authenticateJWT = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (authHeader) {
      jwt.verify(authHeader, 'secretphotos', (err, id) => {
          if (err) {
              return res.sendStatus(403);
          }
          req.id = id;
          next();
      });
  } else {
      res.sendStatus(401);
  }
};

const login = async (req, res, next) => {
  try {

    if (!validate(req.body)) return next(new ExpressError('No credentials provided', 400) );

    foundUser = await user.authenticate(req.body.email, req.body.password);
    if (!foundUser) {
      //return next (new ExpressError('Incorrect username or password', 404) );
      return res.status(404).send({
        message: "Incorrect username or password"
      });
    }
    if (!foundUser.verified) {
      //return next ( new ExpressError('Email not verified', 401) );   
      return res.status(404).send({
        message: "Email not verified"
      });
    }
    
    const token = jwt.sign({
      id: foundUser._id.toString()
    }, 'secretphotos', { expiresIn: '2h' });

    // save user token
    foundUser.sessionToken = token;
    await foundUser.save();

    res.status(200).json(foundUser);
  
  } catch (err) {
    next( err );
  }
};

const register = async (req, res, next) => {
  try {

    if (!validate(req.body))
      return next(new ExpressError('No credentials provided', 400));
      
    const { name, email, password } = req.body;
    const email_lower =  email.toLowerCase()

    const userExist = await user.findOne({ email: email_lower });
    if (userExist) {      
      return res.status(404).send({
        message: "Email already exists"
      });
    }
    const nuUser = new user({
      name,
      email: email_lower,
      password, // password is being hashed inside the schema model as a pre save.
    });

    let token = await new Token({
      userId: nuUser._id.toString(),
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    console.log(token)

    const baseURL = base_url;
    const message = `${baseURL}/api/verify/${token.userId}/${token.token}`;
    await sendEmail(nuUser.email, "Verify Email", message);

    console.log ( await nuUser.save() );

    res.status(200).send(nuUser._id);

  } catch (err) {
    next(err);
  }
}

const submitkey = async (req, res, next) => {
  try {

    let foundUser = await user.findById(req.id.id);

    if (!foundUser) return next( new ExpressError('Not Authenticated', 404) ); 

    if (!req.body) return next( new ExpressError('No data provided', 404) ); // change to a validate inside utils
  
    const { sshkey } = req.body;
      
    foundUser.sshkey = sshkey;

    await foundUser.save();

    message = foundUser._id.toString() + "," + sshkey; 

    //await sendEmail("ivan.granero@us.bosch.com", "New Registration to DEFCON", message);
    await sendEmail(email_username, "New Registration to DEFCON", message);

    return res.status(200).send({
      message: "SSH key submitted successfully: "
    });

  } catch (err) {     
    console.log(err)     
    next( err );
  }
};

const verifyemail = async (req, res, next) => {
  //console.log("Verifying email...");
  //console.log(req.params.id);
  //console.log(req.params.token);
  
  try {
    const veruser = await user.findById(req.params.id);

    if (!veruser) return res.status(200).send("Invalid link user"); // remove the user fb

    if (veruser.verified) return res.status(200).send("Token has already been verified"); 

    console.log (req.params.token) 

    const token = await Token.findOne({
      userId: veruser._id.toString(),
      token: req.params.token,
    });
    
        if (!token) return res.status(200).send("Invalid link token");  // remove the token fb

    veruser.verified = true;
    console.log ( veruser.save() );
    console.log ( await Token.findByIdAndRemove(token._id) );

    //res.send("email verified successfully");
    res.sendFile(path.resolve('src/views/regconfirm.html'));
  } catch (err) {
    next( err );
  }
}

module.exports = {
  register,
  login,
  authenticateJWT,
  verifyemail,
  submitkey
};