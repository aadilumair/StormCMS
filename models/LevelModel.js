var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var LevelSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },

  dateCreated: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("level", LevelSchema);
