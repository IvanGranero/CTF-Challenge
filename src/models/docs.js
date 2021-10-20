const mongoose = require('mongoose');

const docSchema = new mongoose.Schema({
    originalName: String,            
    mimeType: String,
    filePath: String,           
    uploadDate: { type: Date, required: true, default: Date.now }
}, { _id : false });

module.exports = mongoose.model('docModel', docSchema);