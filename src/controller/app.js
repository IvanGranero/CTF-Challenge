
const path = require('path');
const mongoose = require ('mongoose');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');
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

    if (!validate(req.body)) return next( new ExpressError('No credentials provided', 404) );

    foundUser = await user.authenticate(req.body.email, req.body.password);
  
    if (!foundUser) return next ( new ExpressError('Incorrect username or password', 404) );
    
    const token = jwt.sign({
      id: foundUser._id.toString()
    }, 'secretphotos', { expiresIn: '2h' });

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

    const token = jwt.sign({
      id: nuUser._id.toString()
    }, 'secretphotos', { expiresIn: '2h' });

    nuUser.sessionToken = token;

    await nuUser.save();

    res.status(200).send(nuUser._id);

  } catch (err) {
    next(err);
  }
}

const upload = async (req, res, next) => {
  try {

    let foundUser = await user.findById(req.id.id);

    if (!foundUser) return next( new ExpressError('Not Authenticated', 404) ); 

    if (!req.body) return next( new ExpressError('No data provided', 404) ); // change to a validate inside utils
  
    await uploadFile(req, res); 
    uploaded = res.req.file.filename;
    originalname = req.file.originalname;
    mimetype = req.file.mimetype;

    if (req.file.mimetype.split("/")[0] === 'image') {
      await sharp(req.file.path)
        .resize(100, 100)
        .jpeg({ quality: 50 })
        .toFile(__basedir + "/assets/uploads/" + uploaded + "-thumbnail");
    }

    foundUser.documents.push( { originalName: originalname, mimeType: mimetype, filePath: uploaded } );

    await foundUser.save();

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
    console.log(req.id.id);
    let foundUser = await user.findById(req.id.id);
    console.log(foundUser);
    if (!foundUser) return next( new ExpressError('Not Authenticated', 404) ); 
    console.log(foundUser.documents);
    res.status(200).send(foundUser.documents);

  } catch (err) {
    next( err );
  }
};

const download = async (req, res, next) => {
  try {
    console.log("downloading");
    let foundUser = await user.findById(req.id.id);

    if (!foundUser) return next( new ExpressError('Not Authenticated', 404) ); 

    const fileName = req.params.name;         //download/:name       possible change to a get request to use req.body instead
    console.log(fileName);
    const directoryPath = __basedir + "/assets/uploads/";
  
    const foundDoc = foundUser.documents.find( ({ filePath }) => filePath === fileName );
    if (!foundDoc) return next( new ExpressError('Document not found', 404) );

    res.download(directoryPath + fileName, foundDoc.originalName, (err) => {
      if (err) next ( new ExpressError('Could not download the file.' + err, 500) );
    });

  } catch (err) {
    next( err );
  }

};

const remove = async (req, res, next) => {
  try {
    console.log("deleting");
    let foundUser = await user.findById(req.id.id);

    if (!foundUser) return next( new ExpressError('Not Authenticated', 404) ); 

    const fileName = req.params.name;     
    console.log(fileName);
    const directoryPath = __basedir + "/assets/uploads/";

    await foundUser.updateOne({ $pull: { documents: { filePath: { $in: fileName }}}});
    // not removing file for now, just updating the database

    console.log(foundUser.documents);
    res.status(200).send(foundUser.documents);

  } catch (err) {
    next( err );
  }

};

module.exports = {
  upload,
  files,
  download,
  remove,
  register,
  login,
  authenticateJWT
};