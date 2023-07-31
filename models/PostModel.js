var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    status: {
        type: String,
        default: "private",
        required: true
    },

    description: {
        type: String,
        required: true
    },

    dateCreated: {
        type: Date,
        default: Date.now()
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },

    chapter:{
        type: Schema.Types.ObjectId,
        ref: 'chapter'
    },

    position:{
        type: Number,

    },

    

});


module.exports = mongoose.model("post", PostSchema);