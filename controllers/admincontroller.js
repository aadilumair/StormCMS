var Post = require('../models/PostModel');
var Category = require('../models/CategoryModel');
var Level = require('../models/LevelModel');
var Subject = require('../models/SubjectModel');
var {isEmpty} = require('../config/customFunctions');

module.exports = {
    index: (req, res) => {
        res.render('admin/index');
    },


    //Posts control
    getPosts: (req, res) => {
        Post.find().populate('category').then(posts => {
            res.render('admin/posts/index', {posts: posts});
        });
    },

    submitPosts: (req, res) => {
        
        let filename = "";

        console.log(req.files);
        
        if(!isEmpty(req.files)){
            let File = req.files.uploadedFile;
            filename = File.name;
            let uploadDir = './public/uploads/';
            console.log(uploadDir+filename);
            File.mv(uploadDir+filename, (err) =>{
                if(err)
                    throw err;
            } );
        }
        
        //TODO ADD VALIDATION
        const newPost = Post({
            title: req.body.title,
            description: req.body.description,
            status: req.body.status,
            status: req.body.status,
            allowComments: req.body.allowComments? true: false,
            category: req.body.category,
            file: `./uploads/${filename}`
            
        });

        newPost.save().then(post => {
            console.log(post); //Remove this in PRODUCTION
            req.flash('success-message', "Post created successfully");
            res.redirect('/admin/posts');
        });
    },

    createPosts: (req, res) => {
        Category.find().then(cats => {
            res.render('admin/posts/create', {Categories: cats});
        });
    },

    editPosts: (req, res) => {
        var id = req.params.id;
        Post.findById(id)
        .then(post => {
            
            Category.find().then(cats =>{
                res.render('admin/posts/edit', {post: post, categories: cats});
            });
        })
    }, 

    editPostUpdateRoute: (req, res) => {
        const commentsAllowed = req.body.allowComments ? true : false;


        const id = req.params.id;

        Post.findById(id)
            .then(post => {

                post.title = req.body.title;
                post.status = req.body.status;
                post.allowComments = req.body.allowComments;
                post.description = req.body.description;
                post.category = req.body.category;


                post.save().then(updatePost => {
                    req.flash('success-message', `The Post ${updatePost.title} has been updated.`);
                    res.redirect('/admin/posts');

                });
            });

    },

    deletePosts: (req, res) => {
        
        Post.findByIdAndDelete(req.params.id).then(deletedPost => {
            req.flash('success-message', `Post ${deletedPost.title} has been successfully deleted.`);
            res.redirect('/admin/posts')
        });
    },


//Categories control
getCategories: (req, res) => {
    Category.find().then(cats => {
        res.render('admin/categories/index', {categories: cats});
    });
},

createCategories: (req, res) => {
    if (req.body.name){
        var newCat = new Category({
            title: req.body.name
        });

        newCat.save().then(category =>{
            res.status(200).json(category);
        });
    }
},

editCategory: (req, res) => {
    var id = req.params.id;
    
    Category.find().then(cats => {
        Category.findById(id).then(cat => {
            res.render('admin/categories/edit', {category : cat, categories: cats});
        });
        
    });
},

editCategorySubmit: (req, res) => {
    var id = req.params.id;

    if (req.body.name){
        

        Category.findById(id)
            .then(cat => {

                cat.title = req.body.name;
                


                cat.save().then(category =>{
                    res.status(200).json({url: '/admin/categories'});
                });
            });
    }
    

},

//Level Control
getLevels: (req, res) => {
    Level.find().then(Levels => {
        res.render('admin/Levels/index', {levels: Levels});
    });
},

createLevels: (req, res) => {
    if (req.body.name){
        var newLevel = new Level({
            title: req.body.name
        });

        newLevel.save().then(level =>{
            res.status(200).json(level);
        });
    }
},

editLevel: (req, res) => {
    var id = req.params.id;
    
    Level.find().then(levels => {
        Level.findById(id).then(level => {
            res.render('admin/levels/edit', {level : level, levels: levels});
        });
        
    });
},

editLevelSubmit: (req, res) => {
    var id = req.params.id;

    if (req.body.name){
        

        Level.findById(id)
            .then(level => {

                level.title = req.body.name;
                


                level.save().then(level1 =>{
                    res.status(200).json({url: '/admin/levels'});
                });
            });
    }
    

},

//subjects
getSubjects: (req, res) => {
    Subject.find().populate('level').then(Subjects => {
        res.render('admin/subjects/index', {subjects: Subjects});
    });
},

createSubjects: (req, res) => {
    Level.find().then(levs => {
        res.render('admin/subjects/create', {Levels: levs});
    });
},

submitSubjects: (req, res) => {  
    //TODO ADD VALIDATION
    const newSubject = Subject({
        title: req.body.title,
        level: req.body.level
        
    });

    newSubject.save().then(subject => {
        console.log(subject); //Remove this in PRODUCTION
        req.flash('success-message', "Subject created successfully");
        res.redirect('/admin/subjects');
    });
},

};