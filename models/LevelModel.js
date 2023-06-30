var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LevelSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    
    dateCreated: {
        type: Date,
        default: Date.now()
    }
});


module.exports = mongoose.model("level", LevelSchema);