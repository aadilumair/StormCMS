const { listenerCount } = require("../models/CategoryModel");
var User = require("../models/UserModel");
var Post = require("../models/PostModel");
var BlogPost = require("../models/BlogPostModel");

module.exports = {
  selectOption: function (status, options) {
    return options
      .fn(this)
      .replace(new RegExp('value="' + status + '"'), '$&selected="selected"');
  },

  isEmpty: function (obj) {
    for (let key in obj) {
      if (Object.hasOwn(obj, key)) {
        return false;
      }
    }

    return true;
  },

  isUserAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect("/login");
    }
  },

  isUserAdmin: async function (id) {
    var fuser = await User.findOne({ _id: id });
    if (fuser.role == "administrator") return true;
    else return false;
  },

  isUserEditor: async function (id) {
    var fuser = await User.findOne({ _id: id });
    if (fuser.role == "editor") return true;
    else return false;
  },

  isUserAuthor: async function (postId, userId) {
    var fpost = await Post.findOne({ _id: postId });
    var fbpost = await BlogPost.findOne({ _id: postId });
    if (fpost) {
      if (fpost.user == userId) {
        return true;
      } else {
        return false;
      }
    } else if (fbpost) {
      if (fbpost.user == userId) {
        return true;
      } else {
        return false;
      }
    } else return false;
  },
};
