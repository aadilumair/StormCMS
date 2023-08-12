var Post = require("../models/PostModel");
var Category = require("../models/CategoryModel");
var User = require("../models/UserModel");
var bcrypt = require("bcryptjs");
module.exports = {
  index: async (req, res) => {
    var posts = await Post.find();
    var categories = await Category.find();

    res.render("default/index", { posts: posts, categories: categories });
  },

  loginGet: (req, res) => {
    res.render("default/login", { message: req.flash("error") });
  },

  loginPost: (req, res) => {},

  admin: (req, res) => {
    res.render("default/admin");
  },

  about: (req, res) => {
    res.render("default/about");
  },

  singlePost: (req, res) => {
    Post.findById(req.params.id).then((post) => {
      if (!post) {
        res.status(404).json({ message: "Post not found" });
      } else {
        res.render("default/singlePost", { post: post });
      }
    });
  },
};
