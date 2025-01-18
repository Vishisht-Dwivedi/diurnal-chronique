const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: true
    },
    Headline: String,
    Date: String,
    Photo: String,
    Caption: String,
    WebURL: String,
    DateNumber: {
        type: Number,
        required: true
    }
})
const businessModel = mongoose.model('business', businessSchema);
module.exports = businessModel;