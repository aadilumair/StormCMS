var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SubjectSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    
    level:{
        type: Schema.Types.ObjectId,
        ref: 'level'
    },

    dateCreated: {
        type: Date,
        default: Date.now()
    }
});


module.exports = mongoose.model("subject", SubjectSchema);