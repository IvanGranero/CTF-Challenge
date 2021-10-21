const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const docModel = require('./docs');

const userSchema = new mongoose.Schema({
    name: String,               //alphanumeric
    email: {                    //lowercase
        type: String,           
        required: true,
        unique: true
    },                          
    userCategory: {
        type: String,
        required: false,
        default: "user"     // if admin is needed it needs to be changed manually by an admin
    },
    password: { 
        type: String, 
        required: true 
    },
    creationDate: { 
        type: Date, 
        required: true, 
        default: Date.now 
    },
    sessionToken: String,
    documents: [ { type: docModel.schema, required: false } ]
});

userSchema.statics.authenticate = async function (email, password) {

    const foundUser = await this.findOne ({ email });
    if (!foundUser) return false;
    const isValid = await bcrypt.compare(password, foundUser.password);
    return isValid? foundUser : false;
}

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

module.exports  = mongoose.model('userModel', userSchema);
