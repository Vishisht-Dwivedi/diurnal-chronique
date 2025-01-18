const mongoose = require('mongoose');

const topHeadlinesSchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: true
    },
    Headline: String,
    ByLine: String,
    Date: String,
    Keywords: [String],
    Photo: String,
    Caption: String,
    Story: String,
    WebURL: String,
    DateNumber: {
        type: Number,
        required: true
    }
})
const topNewsModel = mongoose.model('topHeadlines', topHeadlinesSchema);
module.exports = topNewsModel;