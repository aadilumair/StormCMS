var Post = require("../models/PostModel");
var Category = require("../models/CategoryModel");
var Level = require("../models/LevelModel");
var Subject = require("../models/SubjectModel");
var Chapter = require("../models/ChapterModel");
var File = require("../models/FileModel");
var User = require("../models/UserModel");
var BlogPost = require("../models/BlogPostModel");
var AdmZip = require("adm-zip");
var Decompress = require("decompress");

var bcrypt = require("bcryptjs");
var fs = require("fs");

var {
  isEmpty,
  isUserAdmin,
  isUserEditor,
  isUserAuthor,
} = require("../config/customFunctions");
const decompress = require("decompress");

module.exports = {
  index: (req, res) => {
    res.render("admin/index");
  },

  //Posts control
  getPosts: (req, res) => {
    Post.find()
      .populate({
        path: "chapter",
        populate: { path: "subject", populate: { path: "level" } },
      })
      .populate("user")
      .then((posts) => {
        res.render("admin/posts/index", { posts: posts });
      });
  },

  submitPosts: (req, res) => {
    //TODO ADD VALIDATION
    const newPost = Post({
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      chapter: req.body.chapter,
      position: req.body.position,
      user: req.user.id,
    });

    newPost.save().then((post) => {
      console.log(post); //Remove this in PRODUCTION
      req.flash("success-message", "Post created successfully");
      res.redirect("/admin/posts");
    });
  },

  createPosts: (req, res) => {
    Chapter.find()
      .populate({ path: "subject", populate: { path: "level" } })
      .then((chapts) => {
        res.render("admin/posts/create", { Chapters: chapts });
      });
  },

  editPosts: async (req, res) => {
    if (
      (await isUserAuthor(req.params.id, req.user.id)) ||
      (await isUserEditor(req.user.id)) ||
      (await isUserAdmin(req.user.id))
    ) {
      var id = req.params.id;
      Post.findById(id)
        .populate({
          path: "chapter",
          populate: { path: "subject", populate: { path: "level" } },
        })
        .then((post) => {
          Chapter.find()
            .populate({ path: "subject", populate: { path: "level" } })
            .then((chapts) => {
              res.render("admin/posts/edit", { post: post, Chapters: chapts });
            });
        });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  editPostUpdateRoute: async (req, res) => {
    if (
      (await isUserAuthor(req.params.id, req.user.id)) ||
      (await isUserEditor(req.user.id)) ||
      (await isUserAdmin(req.user.id))
    ) {
      const id = req.params.id;

      Post.findById(id).then((post) => {
        post.title = req.body.title;
        post.description = req.body.description;
        post.status = req.body.status;
        post.chapter = req.body.chapter;
        post.position = req.body.position;
        post.user = req.user.id;

        post.save().then((updatePost) => {
          req.flash(
            "success-message",
            `The Post ${updatePost.title} has been updated.`
          );
          res.redirect("/admin/posts");
        });
      });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  deletePosts: (req, res) => {
    Post.findByIdAndDelete(req.params.id).then((deletedPost) => {
      req.flash(
        "success-message",
        `Post ${deletedPost.title} has been successfully deleted.`
      );
      res.redirect("/admin/posts");
    });
  },

  //Categories control
  getCategories: async (req, res) => {
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      Category.find()
        .populate("user")
        .then((cats) => {
          res.render("admin/categories/index", { categories: cats });
        });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  createCategories: async (req, res) => {
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      if (req.body.name) {
        var newCat = new Category({
          title: req.body.name,
          user: req.user.id,
        });

        newCat.save().then((category2) => {
          res.status(200).json({ url: "/admin/categories" });
        });
      }
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  editCategory: async (req, res) => {
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      var id = req.params.id;

      Category.find().then((cats) => {
        Category.findById(id).then((cat) => {
          res.render("admin/categories/edit", {
            category: cat,
            categories: cats,
          });
        });
      });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  editCategorySubmit: async (req, res) => {
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      var id = req.params.id;

      if (req.body.name) {
        Category.findById(id).then((cat) => {
          cat.title = req.body.name;
          cat.save().then((category1) => {
            res.status(200).json({ url: "/admin/categories" });
          });
        });
      }
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  deleteCategories: async (req, res) => {
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      BlogPost.find({ category: req.params.id }).then((LinkedCats) => {
        if (!LinkedCats.length) {
          Category.findByIdAndDelete(req.params.id).then((deletedCategory) => {
            req.flash(
              "success-message",
              `Category ${deletedCategory.title} has been successfully deleted.`
            );
            res.redirect("/admin/categories");
          });
        } else {
          Category.findById(req.params.id).then((unDeletedCategory) => {
            req.flash(
              "error-message",
              `Category ${unDeletedCategory.title} is linked to posts and cannot be deleted.`
            );
            res.redirect("/admin/categories");
          });
        }
      });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  //Posts control
  getBlogPosts: (req, res) => {
    BlogPost.find()
      .populate("user")
      .populate("category")
      .then((BlogPosts) => {
        res.render("admin/blogPosts/index", { blogPosts: BlogPosts });
      });
  },

  createBlogPosts: (req, res) => {
    Category.find().then((cats) => {
      res.render("admin/blogPosts/create", { Categories: cats });
    });
  },

  submitBlogPosts: (req, res) => {
    //TODO ADD VALIDATION
    const newBlogPost = BlogPost({
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      category: req.body.category,
      user: req.user.id,
    });

    newBlogPost.save().then((blogPost) => {
      req.flash("success-message", "Post created successfully");
      res.redirect("/admin/blogPosts");
    });
  },

  editBlogPosts: async (req, res) => {
    if (
      (await isUserAuthor(req.params.id, req.user.id)) ||
      (await isUserEditor(req.user.id)) ||
      (await isUserAdmin(req.user.id))
    ) {
      var id = req.params.id;
      BlogPost.findById(id)
        .populate("category")
        .then((blogPost) => {
          Category.find().then((cats) => {
            res.render("admin/blogPosts/edit", {
              blogPost: blogPost,
              Categories: cats,
            });
          });
        });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  editBlogPostUpdateRoute: async (req, res) => {
    if (
      (await isUserAuthor(req.params.id, req.user.id)) ||
      (await isUserEditor(req.user.id)) ||
      (await isUserAdmin(req.user.id))
    ) {
      const id = req.params.id;

      BlogPost.findById(id).then((blogPost) => {
        blogPost.title = req.body.title;
        blogPost.description = req.body.description;
        blogPost.status = req.body.status;
        blogPost.category = req.body.category;

        blogPost.save().then((updateBlogPost) => {
          req.flash(
            "success-message",
            `The Blog Post ${updateBlogPost.title} has been updated.`
          );
          res.redirect("/admin/blogPosts");
        });
      });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  deleteBlogPosts: async (req, res) => {
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      BlogPost.findByIdAndDelete(req.params.id).then((deletedBlogPost) => {
        req.flash(
          "success-message",
          `Blog Post ${deletedBlogPost.title} has been successfully deleted.`
        );
        res.redirect("/admin/blogPosts");
      });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  //Level Control
  getLevels: async (req, res) => {
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      Level.find()
        .populate("user")
        .then((Levels) => {
          res.render("admin/levels/index", { levels: Levels });
        });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  createLevels: async (req, res) => {
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      if (req.body.name) {
        var newLevel = new Level({
          title: req.body.name,
          user: req.user.id,
        });

        newLevel.save().then((level) => {
          res.status(200).json({ url: "/admin/levels" });
        });
      }
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  editLevel: async (req, res) => {
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      var id = req.params.id;

      Level.find().then((levels) => {
        Level.findById(id)
          .populate("user")
          .then((level) => {
            res.render("admin/levels/edit", { level: level, levels: levels });
          });
      });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  editLevelSubmit: async (req, res) => {
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      var id = req.params.id;

      if (req.body.name) {
        Level.findById(id).then((level) => {
          level.title = req.body.name;
          level.save().then((level1) => {
            res.status(200).json({ url: "/admin/levels" });
          });
        });
      }
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  deleteLevels: async (req, res) => {
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      Subject.find({ level: req.params.id }).then((LinkedSubs) => {
        if (!LinkedSubs.length) {
          Level.findByIdAndDelete(req.params.id).then((deletedLevel) => {
            req.flash(
              "success-message",
              `Level ${deletedLevel.title} has been successfully deleted.`
            );
            res.redirect("/admin/levels");
          });
        } else {
          Level.findById(req.params.id).then((unDeletedLevel) => {
            req.flash(
              "error-message",
              `Level ${unDeletedLevel.title} is linked to subjects and cannot be deleted.`
            );
            res.redirect("/admin/levels");
          });
        }
      });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  //subjects
  getSubjects: async (req, res) => {
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      Subject.find()
        .populate("level")
        .populate("user")
        .then((Subjects) => {
          res.render("admin/subjects/index", { subjects: Subjects });
        });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  createSubjects: async (req, res) => {
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      Level.find().then((levs) => {
        res.render("admin/subjects/create", { Levels: levs });
      });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  submitSubjects: async (req, res) => {
    //TODO ADD VALIDATION
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      const newSubject = Subject({
        title: req.body.title,
        level: req.body.level,
        user: req.user.id,
      });

      newSubject.save().then((subject) => {
        console.log(subject); //Remove this in PRODUCTION
        req.flash("success-message", "Subject created successfully");
        res.redirect("/admin/subjects");
      });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  editSubject: async (req, res) => {
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      var id = req.params.id;
      Subject.findById(id).then((subject) => {
        Level.find().then((levs) => {
          res.render("admin/subjects/edit", { subject: subject, levels: levs });
        });
      });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  editSubjectUpdateRoute: async (req, res) => {
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      const id = req.params.id;

      Subject.findById(id).then((subject) => {
        subject.title = req.body.title;
        subject.level = req.body.level;

        subject.save().then((updateSubject) => {
          req.flash(
            "success-message",
            `The Subject ${updateSubject.title} has been updated.`
          );
          res.redirect("/admin/subjects");
        });
      });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  deleteSubjects: async (req, res) => {
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      Chapter.find({ subject: req.params.id }).then((LinkedChapts) => {
        if (!LinkedChapts.length) {
          Subject.findByIdAndDelete(req.params.id).then((deletedSubject) => {
            req.flash(
              "success-message",
              `Subject ${deletedSubject.title} has been successfully deleted.`
            );
            res.redirect("/admin/subjects");
          });
        } else {
          Subject.findById(req.params.id).then((unDeletedSubject) => {
            req.flash(
              "error-message",
              `Subject ${unDeletedSubject.title} is linked to chapters and cannot be deleted.`
            );
            res.redirect("/admin/subjects");
          });
        }
      });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  //chapters mechanism
  getChapters: async (req, res) => {
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      Chapter.find()
        .populate({ path: "subject", populate: { path: "level" } })
        .populate("user")
        .then((Chapters) => {
          res.render("admin/chapters/index", { chapters: Chapters });
        });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  createChapters: async (req, res) => {
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      Subject.find()
        .populate("level")
        .then((subs) => {
          res.render("admin/chapters/create", { Subjects: subs });
        });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  submitChapters: async (req, res) => {
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      //TODO ADD VALIDATION
      const newChapter = Chapter({
        title: req.body.title,
        subject: req.body.subject,
        position: req.body.position,
        user: req.user.id,
      });

      newChapter.save().then((chapter) => {
        console.log(chapter); //Remove this in PRODUCTION
        req.flash("success-message", "Chapter created successfully");
        res.redirect("/admin/chapters");
      });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  editChapter: async (req, res) => {
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      var id = req.params.id;
      Chapter.findById(id).then((chapter) => {
        Subject.find()
          .populate("level")
          .then((subs) => {
            res.render("admin/chapters/edit", {
              chapter: chapter,
              subjects: subs,
            });
          });
      });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  editChapterSubmit: async (req, res) => {
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      const id = req.params.id;

      Chapter.findById(id).then((chapter) => {
        chapter.title = req.body.title;
        chapter.subject = req.body.subject;
        chapter.position = req.body.position;

        chapter.save().then((updateChapter) => {
          req.flash(
            "success-message",
            `The Chapter ${updateChapter.title} has been updated.`
          );
          res.redirect("/admin/chapters");
        });
      });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  deleteChapters: async (req, res) => {
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      Post.find({ chapter: req.params.id }).then((LinkedPosts) => {
        if (!LinkedPosts.length) {
          Chapter.findByIdAndDelete(req.params.id).then((deletedChapter) => {
            req.flash(
              "success-message",
              `Chapter ${deletedChapter.title} has been successfully deleted.`
            );
            res.redirect("/admin/chapters");
          });
        } else {
          Chapter.findById(req.params.id).then((unDeletedChapter) => {
            req.flash(
              "error-message",
              `Chapter ${unDeletedChapter.title} is linked to posts and cannot be deleted.`
            );
            res.redirect("/admin/chapters");
          });
        }
      });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  //file uploads

  getFiles: (req, res) => {
    File.find()
      .populate("user")
      .then((files) => {
        res.render("admin/fileUploads/index", { files: files });
      });
  },

  createFiles: (req, res) => {
    res.render("admin/fileUploads/create");
  },

  submitFiles: (req, res) => {
    let filename = "";

    console.log(req.files); //remove in prod

    if (!isEmpty(req.files)) {
      let File = req.files.uploadedFile;
      let timestamp = Date.now();
      filename = timestamp + File.name;
      let uploadDir = "./public/uploads/";

      File.mv(uploadDir + filename, (err) => {
        if (err) throw err;
      });
    }

    //TODO ADD VALIDATION
    const newFile = File({
      title: req.body.title,
      tags: req.body.tags,
      type: req.body.type,
      //status: req.body.status,

      filepath: `/uploads/${filename}`,
    });

    newFile.save().then((file) => {
      console.log(file); //Remove this in PRODUCTION
      req.flash("success-message", "File uploaded successfully");
      res.redirect("/admin/fileUploads");
    });
  },

  deleteFiles: async (req, res) => {
    if ((await isUserAdmin(req.user.id)) || (await isUserEditor(req.user.id))) {
      File.findByIdAndDelete(req.params.id).then((deletedFile) => {
        let path = "./public" + deletedFile.filepath;

        fs.unlink(path, (err) => {
          if (err) {
            console.error(err);
            return;
          }

          //file removed
        });

        req.flash(
          "success-message",
          `File ${deletedFile.title} has been successfully deleted.`
        );
        res.redirect("/admin/fileUploads");
      });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },
  //users

  getUsers: async (req, res) => {
    if (await isUserAdmin(req.user.id)) {
      User.find().then((Users) => {
        res.render("admin/users/index", { users: Users });
      });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  registerGet: async (req, res) => {
    if (await isUserAdmin(req.user.id)) {
      res.render("admin/users/create");
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  registerPost: async (req, res) => {
    if (await isUserAdmin(req.user.id)) {
      let errors = [];
      if (!req.body.firstName) {
        errors.push({ message: "First Name is mandatory" });
      }
      if (!req.body.lastName) {
        errors.push({ message: "Last Name is mandatory" });
      }
      if (!req.body.email) {
        errors.push({ message: "Email is mandatory" });
      }
      if (req.body.password != req.body.passwordConfirm) {
        errors.push({ password: "Passwords do not match" });
      }

      if (errors.length > 0) {
        res.render("/admin/users/create", {
          errors: errors,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          role: req.body.role,
          email: req.body.email,
        });
      } else {
        User.findOne({ email: req.body.email }).then((user) => {
          if (user) {
            req.flash(
              "error-message",
              "Email in use, please try a different one"
            );
            res.redirect("/admin/users/create");
          } else {
            var newUser = new User(req.body);

            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                newUser.password = hash;
                newUser.save().then((user) => {
                  req.flash("success-message", "Registeration successful");
                  res.redirect("/admin/users");
                });
              });
            });
          }
        });
      }
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  editUser: async (req, res) => {
    if (await isUserAdmin(req.user.id)) {
      var id = req.params.id;
      User.findById(id).then((user) => {
        res.render("admin/users/edit", { User: user });
      });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  editUserSubmit: async (req, res) => {
    if (await isUserAdmin(req.user.id)) {
      const id = req.params.id;
      let errors = [];
      if (!req.body.firstName) {
        errors.push({ message: "First Name is mandatory" });
      }
      if (!req.body.lastName) {
        errors.push({ message: "Last Name is mandatory" });
      }

      if (!req.body.role) {
        errors.push({ message: "Role is mandatory" });
      }

      if (req.body.password && req.body.password != req.body.passwordConfirm) {
        errors.push({ password: "Passwords do not match" });
      }

      if (errors.length > 0) {
        User.findById(id).then((user) => {
          res.render("admin/users/edit", { User: user, errors: errors });
        });
      } else {
        User.findById(id).then((user) => {
          user.firstName = req.body.firstName;
          user.lastName = req.body.lastName;
          user.role = req.body.role;

          if (req.body.password) {
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(req.body.password, salt, (err, hash) => {
                user.password = hash;
                user.save().then((updateUser) => {
                  req.flash(
                    "success-message",
                    `The User ${updateUser.firstName} ${updateUser.lastName} has been updated.`
                  );
                  res.redirect("/admin/users");
                });
              });
            });
          } else {
            user.save().then((updateUser) => {
              req.flash(
                "success-message",
                `The User ${updateUser.firstName} ${updateUser.lastName} has been updated.`
              );
              res.redirect("/admin/users");
            });
          }
        });
      }
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  deleteUsers: async (req, res) => {
    if (await isUserAdmin(req.user.id)) {
      Post.find({ user: req.params.id }).then((LinkedPosts) => {
        BlogPost.find({ user: req.params.id }).then((LinkedBlogPosts) => {
          Category.find({ user: req.params.id }).then((LinkedCategories) => {
            Chapter.find({ user: req.params.id }).then((LinkedChapters) => {
              Subject.find({ user: req.params.id }).then((LinkedSubjects) => {
                Level.find({ user: req.params.id }).then((LinkedLevels) => {
                  if (
                    !(
                      LinkedPosts.length ||
                      LinkedBlogPosts.length ||
                      LinkedCategories.length ||
                      LinkedChapters.length ||
                      LinkedSubjects.length ||
                      LinkedLevels.length
                    )
                  ) {
                    User.findByIdAndDelete(req.params.id).then(
                      (deletedUser) => {
                        req.flash(
                          "success-message",
                          `User ${deletedUser.firstName} ${deletedUser.lastName} has been successfully deleted.`
                        );
                        res.redirect("/admin/users");
                      }
                    );
                  } else {
                    User.findById(req.params.id).then((unDeletedUser) => {
                      req.flash(
                        "error-message",
                        `User ${unDeletedUser.firstName} ${unDeletedUser.lastName} is linked to elements and cannot be deleted. Consider changing their password to lock access.`
                      );
                      res.redirect("/admin/users");
                    });
                  }
                });
              });
            });
          });
        });
      });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  selfEdit: (req, res) => {
    var id = req.user.id;
    User.findById(id).then((user) => {
      res.render("admin/users/selfEdit", { User: user });
    });
  },

  selfEditUserSubmit: (req, res) => {
    const id = req.user.id;
    let errors = [];
    if (!req.body.firstName) {
      errors.push({ message: "First Name is mandatory" });
    }
    if (!req.body.lastName) {
      errors.push({ message: "Last Name is mandatory" });
    }

    if (req.body.password && req.body.password != req.body.passwordConfirm) {
      errors.push({ password: "Passwords do not match" });
    }

    if (errors.length > 0) {
      User.findById(id).then((user) => {
        res.render("admin/selfEdit", { User: user, errors: errors });
      });
    } else {
      User.findById(id).then((user) => {
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;

        if (req.body.password) {
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.password, salt, (err, hash) => {
              user.password = hash;
              user.save().then((updateUser) => {
                req.flash(
                  "success-message",
                  `The User ${updateUser.firstName} ${updateUser.lastName} has been updated.`
                );
                res.redirect("/admin");
              });
            });
          });
        } else {
          user.save().then((updateUser) => {
            req.flash(
              "success-message",
              `The User ${updateUser.firstName} ${updateUser.lastName} has been updated.`
            );
            res.redirect("/admin");
          });
        }
      });
    }
  },

  getSettings: async (req, res) => {
    if (await isUserAdmin(req.user.id)) {
      res.render("admin/settings/index");
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  runBackup: async (req, res) => {
    if (await isUserAdmin(req.user.id)) {
      File.find().then((files) => {
        var zip = new AdmZip();

        for (let i = 0; i < files.length; i++) {
          zip.addLocalFile(`./public${files[i].filepath}`);
        }

        const downloadName = `${Date.now()}.zip`;
        const data = zip.toBuffer();
        res.set("Content-Type", "application/octet-stream");
        res.set("Content-Disposition", `attachment; filename=${downloadName}`);
        res.set("Content-Length", data.length);
        res.send(data);
      });
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },

  importBackup: async (req, res) => {
    if (await isUserAdmin(req.user.id)) {
      let filename = "";

      console.log(req.files); //remove in prod

      if (!isEmpty(req.files)) {
        let File = req.files.uploadedFile;
        let timestamp = Date.now();
        filename = File.name;
        let uploadDir = "./public/uploads/";

        File.mv(uploadDir + filename, (err) => {
          if (err) throw err;
        });
        await new Promise(resolve => setTimeout(resolve, 5000));
        (async () => {
          try {
            const files = await decompress(uploadDir + filename, uploadDir, {
              map: (file) => {
                if (file.type === "file" && file.path.endsWith("/")) {
                  file.type = "directory";
                }
                return file;
              },
            });
          } catch (error) {
            console.log(error);
          }
        })();
        fs.unlink(uploadDir + filename, (err) => {
          if (err) {
            console.error(err);
            return;
          }

          //file removed
        });
        req.flash("success-message", `Zip import successful.`);
        res.redirect("/admin/settings");
      }
    } else {
      req.flash(
        "error-message",
        `You do not have access to this part of the site.`
      );
      res.redirect("/admin");
    }
  },
};
