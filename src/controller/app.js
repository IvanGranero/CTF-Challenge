
const path = require('path');
const mongoose = require ('mongoose');
const jwt = require('jsonwebtoken');
const uploadFile = require("../utils/upload");
const ExpressError = require('../utils/ExpressError');
const user =  require('../models/users');

mongoose.connect('mongodb://localhost:27017/photosdb', { useNewUrlParser: true, useUnifiedTopology: true })
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

const login = async (req, res, next) => {
  try {

    if (!validate(req.body)) return next( new ExpressError('No credentials provided', 404) );

    foundUser = await user.authenticate(req.body.email, req.body.password);
  
    if (!foundUser) return next ( new ExpressError('Incorrect username or password', 404) );
    
    const token = jwt.sign({
      email: foundUser.email
    }, foundUser._id.toString(), { expiresIn: '2h' });

    // save user token
    foundUser.sessionToken = token;

    // user
    res.status(200).json(foundUser);
  
  } catch (err) {
    next( err );
  }
};


const register = async (req, res, next) => {
  try {

    if (!validate(req.body))
      return next(new ExpressError('No credentials provided', 404));
      
    const { name, email, password } = req.body;

    const nuUser = new user({
      name,
      email,
      password, // password is being hashed inside the schema model as a pre save.
    });

    console.log(nuUser._id.toString());
    console.log(nuUser.email);

    const token = jwt.sign({
      email: email
    }, nuUser._id.toString(), { expiresIn: '2h' });

    nuUser.sessionToken = token;

    await nuUser.save();

    res.status(200).send(nuUser._id);

  } catch (err) {
    next(err);
  }
}

const upload = async (req, res, next) => {
  try {

    console.log(req.headers.get('Authorization'));
    if (!req.headers.get('Authorization')) return next( new ExpressError('Not Authenticated', 404) ); 

    if (!req.body) return next( new ExpressError('No data provided', 404) ); // change to a validate inside utils
    
    await uploadFile(req, res);
    uploaded = res.req.file.filename;
    originalname = req.file.originalname;
    mimetype = req.file.mimetype;

    let userFound = await user.findById(req.session.user_id); 
    userFound.documents.push( { originalName: originalname, mimeType: mimetype, filePath: uploaded } );

    await userFound.save();

    return res.status(200).send({
      message: "Uploaded the file successfully: " + uploaded
    });

  } catch (err) {
    if (err.code == "LIMIT_FILE_SIZE") {
      return next( new ExpressError( "File size cannot be larger than 10MB!", 400 ) );
    }
    next( err );
  }
};

const files = async (req, res, next) => {
  // think about how to send do a server side pagination  get /files?page=1&size=5
  try {

    console.log(req.headers.get('Authorization'));
    if (!req.headers.get('Authorization')) return next( new ExpressError('Not Authenticated', 404) ); 

    const foundUser = await user.findById(req.session.user_id);

    if (!foundUser) return next( new ExpressError('Not Authenticated', 404) ); 
    res.status(200).send(foundUser.documents);

  } catch (err) {
    next( err );
  }
};

const download = async (req, res, next) => {
  try {
    console.log(req.headers.get('Authorization'));

    if (!req.headers.get('Authorization')) return next( new ExpressError('Not Authenticated', 404) ); 

    const fileName = req.params.name;         //download/:name       possible change to a get request to use req.body instead
    const directoryPath = __basedir + "/assets/uploads/";
  
    const foundUser = await user.findById(req.session.user_id);
    if (!foundUser) return next( new ExpressError('Not Authenticated', 404) );  // think about maybe removing the session
  
    const foundDoc = foundUser.documents.find( ({ filePath }) => filePath === fileName );
    if (!foundDoc) return next( new ExpressError('Document not found', 404) );
  
    res.download(directoryPath + fileName, foundDoc.originalName, (err) => {
      if (err) next ( new ExpressError('Could not download the file.' + err, 500) );
    });

  } catch (err) {
    next( err );
  }

};

module.exports = {
  upload,
  files,
  download,
  register,
  login
};