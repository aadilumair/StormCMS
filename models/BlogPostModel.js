var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var BlogPostSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    default: "private",
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  dateCreated: {
    type: Date,
    default: Date.now(),
  },

  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },

  category: {
    type: Schema.Types.ObjectId,
    ref: "category",
  },
});

module.exports = mongoose.model("blogPost", BlogPostSchema);
