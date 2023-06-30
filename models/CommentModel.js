var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
    body: {
        type: String,
        required: true
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },

    commentIsApproved: {
        type: Boolean,
        default: false,
        required: true
    },
    
    dateCreated: {
        type: Date,
        default: Date.now()
    }
});


module.exports = mongoose.model("comment", CommentSchema);