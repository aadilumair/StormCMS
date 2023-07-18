var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ChapterSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    
    subject:{
        type: Schema.Types.ObjectId,
        ref: 'subject'
    },

    dateCreated: {
        type: Date,
        default: Date.now()
    }
});


module.exports = mongoose.model("chapter", ChapterSchema);