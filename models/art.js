const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    artist_id: {
        type: Number,
        required: true
    }
})

const artSchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    image_Id: {
        type: String,
        required: true
    },
    artist_display: String,
    description: {
        type: String,
        required: true
    },
    provenance_text: {
        type: String,
        required: true
    },
    artist: {
        type: artistSchema,
        required: true
    },
    keywords: [String],
    IIIFBase: {
        type: String,
        required: true
    }
});
const ArtModel = mongoose.model("Art", artSchema);
module.exports = ArtModel;