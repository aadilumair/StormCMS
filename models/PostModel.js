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

    category:{
        type: Schema.Types.ObjectId,
        ref: 'category'
    },

    comments:[{
        type: Schema.Types.ObjectId,
        ref: 'comment'
    }],

    allowComments:{
        type: Boolean,
        default: false 
    },

    file: {
        type: String,
        default: ''
    }

});


module.exports = mongoose.model("post", PostSchema);