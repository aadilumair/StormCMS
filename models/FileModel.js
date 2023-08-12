var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var FileSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  filepath: {
    type: String,
    default: "",
    required: true,
  },

  tags: {
    type: String,
  },

  type: {
    type: String,
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

module.exports = mongoose.model("file", FileSchema);
