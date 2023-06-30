var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    
    dateCreated: {
        type: Date,
        default: Date.now()
    }
});


module.exports = mongoose.model("category", CategorySchema);