var Post = require('../models/PostModel');
var Category = require('../models/CategoryModel');
var Level = require('../models/LevelModel');
var Subject = require('../models/SubjectModel');
var Chapter = require('../models/ChapterModel');
var File = require('../models/FileModel');
var User = require('../models/UserModel');

var bcrypt = require('bcryptjs');
var fs = require('fs');

var {isEmpty} = require('../config/customFunctions');

module.exports = {
    index: (req, res) => {
        res.render('admin/index');
    },


    //Posts control
    getPosts: (req, res) => {
        Post.find().populate({path:'chapter',populate: {path: 'subject', populate: {path: 'level'} }}).populate('user').then(posts => {
            res.render('admin/posts/index', {posts: posts});
            
        });
    },

    submitPosts: (req, res) => {
        //TODO ADD VALIDATION
        const newPost = Post({
            title: req.body.title,
            description: req.body.description,
            status: req.body.status,
            chapter: req.body.chapter,
            position:req.body.position,
            user:req.user.id,    
        });

        newPost.save().then(post => {
            console.log(post); //Remove this in PRODUCTION
            req.flash('success-message', "Post created successfully");
            res.redirect('/admin/posts');
        });
    },

    createPosts: (req, res) => {
        Chapter.find().populate({path: 'subject', populate: {path: 'level'} }).then(chapts => {
            res.render('admin/posts/create', {Chapters: chapts});
        });
    },

    editPosts: (req, res) => {
        var id = req.params.id;
        Post.findById(id).populate({path:'chapter',populate: {path: 'subject', populate: {path: 'level'} }})
        .then(post => {
            Chapter.find().populate({path: 'subject', populate: {path: 'level'} }).then(chapts => {
                res.render('admin/posts/edit', {post: post, Chapters: chapts});
            })
        })
    }, 

    editPostUpdateRoute: (req, res) => {
        const id = req.params.id;

        Post.findById(id)
            .then(post => {

                post.title = req.body.title;
                post.description = req.body.description;
                post.status = req.body.status;
                post.chapter = req.body.chapter;
                post.position = req.body.position;
                post.user = req.user.id;
 

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
    Category.find().populate('user').then(cats => {
        res.render('admin/categories/index', {categories: cats});
    });
},

createCategories: (req, res) => {
    if (req.body.name){
        var newCat = new Category({
            title: req.body.name,
            user: req.user._id
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
    Level.find().populate('user').then(Levels => {
        res.render('admin/levels/index', {levels: Levels});
    });
},

createLevels: (req, res) => {
    if (req.body.name){
        var newLevel = new Level({
            title: req.body.name,
            user:req.user.id,
        });

        newLevel.save().then(level =>{
            res.status(200).json(level);
        });
    }
},

editLevel: (req, res) => {
    var id = req.params.id;
    
    Level.find().then(levels => {
        Level.findById(id).populate('user').then(level => {
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

deleteLevels: (req, res) => {
    
    Subject.find({level: req.params.id}).then(LinkedSubs => {
        if(!(LinkedSubs.length))
        {
            Level.findByIdAndDelete(req.params.id).then(deletedLevel => {
                req.flash('success-message', `Level ${deletedLevel.title} has been successfully deleted.`);
                res.redirect('/admin/levels');
            });
        }
        else{
            Level.findById(req.params.id).then(unDeletedLevel => {
                req.flash('error-message', `Level ${unDeletedLevel.title} is linked to subjects and cannot be deleted.`);
            res.redirect('/admin/levels');
            });
        }
    });

    
},



//subjects
getSubjects: (req, res) => {
    Subject.find().populate('level').populate('user').then(Subjects => {
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
        level: req.body.level,
         user:req.user.id,
        
    });

    newSubject.save().then(subject => {
        console.log(subject); //Remove this in PRODUCTION
        req.flash('success-message', "Subject created successfully");
        res.redirect('/admin/subjects');
    });
},

editSubject: (req, res) => {
    var id = req.params.id;
    Subject.findById(id)
    .then(subject => {
        
        Level.find().then(levs =>{
            res.render('admin/subjects/edit', {subject: subject, levels: levs});
        });
    })
},

editSubjectUpdateRoute: (req, res) => {
    
    const id = req.params.id;

    Subject.findById(id)
        .then(subject => {

            subject.title = req.body.title;
            subject.level = req.body.level;
        


            subject.save().then(updateSubject => {
                req.flash('success-message', `The Subject ${updateSubject.title} has been updated.`);
                res.redirect('/admin/subjects');

            });
        });

},

deleteSubjects: (req, res) => {
        
    Chapter.find({subject: req.params.id}).then(LinkedChapts => {
        if(!(LinkedChapts.length))
        {
            Subject.findByIdAndDelete(req.params.id).then(deletedSubject => {
                req.flash('success-message', `Subject ${deletedSubject.title} has been successfully deleted.`);
                res.redirect('/admin/subjects')
            });
        }
        else{
            Subject.findById(req.params.id).then(unDeletedSubject => {
                req.flash('error-message', `Subject ${unDeletedSubject.title} is linked to chapters and cannot be deleted.`);
                res.redirect('/admin/subjects')
            });
        } 
    });
},

//chapters mechanism
getChapters: (req, res) => {
    Chapter.find().populate({path: 'subject', populate: {path: 'level'} }).populate('user').then(Chapters => {
        res.render('admin/chapters/index', {chapters: Chapters});
    });
},

createChapters: (req, res) => {
    Subject.find().populate('level').then(subs => {
        res.render('admin/chapters/create', {Subjects: subs});
    });
},

submitChapters: (req, res) => {  
    //TODO ADD VALIDATION
    const newChapter = Chapter({
        title: req.body.title,
        subject: req.body.subject,
        position:req.body.position,
        user:req.user.id,
        
    });

    newChapter.save().then(chapter => {
        console.log(chapter); //Remove this in PRODUCTION
        req.flash('success-message', "Chapter created successfully");
        res.redirect('/admin/chapters');
    });
},

editChapter: (req, res) => {
    var id = req.params.id;
    Chapter.findById(id)
    .then(chapter => {
        
        Subject.find().populate('level').then(subs =>{
            res.render('admin/chapters/edit', {chapter: chapter, subjects: subs});
        });
    })
},

editChapterSubmit: (req, res) => {
    
    const id = req.params.id;

    Chapter.findById(id)
        .then(chapter => {

            chapter.title = req.body.title;
            chapter.subject = req.body.subject;
            chapter.position = req.body.position;


            chapter.save().then(updateChapter => {
                req.flash('success-message', `The Chapter ${updateChapter.title} has been updated.`);
                res.redirect('/admin/chapters');

            });
        });

},

deleteChapters: (req, res) => {
    
    Post.find({chapter: req.params.id}).then(LinkedPosts => {
        if(!(LinkedPosts.length))
        {
            Chapter.findByIdAndDelete(req.params.id).then(deletedChapter => {
                req.flash('success-message', `Chapter ${deletedChapter.title} has been successfully deleted.`);
                res.redirect('/admin/chapters')
            });
        }
        else{
            Chapter.findById(req.params.id).then(unDeletedChapter => {
                req.flash('error-message', `Chapter ${unDeletedChapter.title} is linked to posts and cannot be deleted.`);
                res.redirect('/admin/chapters')
            });
        } 
    });
},

//file uploads

getFiles: (req, res) => {
    File.find().populate('user').then(files => {
        res.render('admin/fileUploads/index', {files: files});
    });
},

createFiles: (req, res) => {
    res.render('admin/fileUploads/create');
},

submitFiles: (req, res) =>{
    let filename = "";

        console.log(req.files); //remove in prod
        
        if(!isEmpty(req.files)){
            let File = req.files.uploadedFile;
            let timestamp = Date.now();
            filename = timestamp + File.name;
            let uploadDir = './public/uploads/';
            
            
            
            File.mv(uploadDir+filename, (err) =>{
                if(err)
                    throw err;
            } );
        }
        
        //TODO ADD VALIDATION
        const newFile = File({
            title: req.body.title,
            tags: req.body.tags,
            type: req.body.type,
            //status: req.body.status,
            
            filepath: `/uploads/${filename}`
            
        });

        newFile.save().then(file => {
            console.log(file); //Remove this in PRODUCTION
            req.flash('success-message', "File uploaded successfully");
            res.redirect('/admin/fileUploads');
        });
},

deleteFiles: (req, res) => {
        
    File.findByIdAndDelete(req.params.id).then(deletedFile => {
        
        let path ='./public'+deletedFile.filepath;

        fs.unlink(path, (err) => {
            if (err) {
              console.error(err)
              return
            }
          
            //file removed
          })
          
          
        req.flash('success-message', `File ${deletedFile.title} has been successfully deleted.`);
        res.redirect('/admin/fileUploads')
    });
},
//users

getUsers: (req, res) => {
    User.find().then(Users => {
        res.render('admin/users/index', {users: Users});
    });
},


registerGet: (req, res) => {
        res.render('admin/users/create');
    },
    
registerPost: (req, res) => {
        let errors = [];
        if(!req.body.firstName){
            errors.push({message: 'First Name is mandatory'});
        }
        if(!req.body.lastName){
            errors.push({message: 'Last Name is mandatory'});
        }
        if(!req.body.email){
            errors.push({message: 'Email is mandatory'});
        }
        if(req.body.password!=req.body.passwordConfirm){
            errors.push({password: 'Passwords do not match'});
        }
        
        if(errors.length>0){
            res.render('/admin/users/create', {
                errors: errors,
                firstName: req.body.firstName,
                lastName:req.body.lastName,
                email:req.body.email,
            })
        }
        else {
            User.findOne({email:req.body.email}).then(user => {
                if(user){
                    req.flash("error-message", 'Email in use, please try a different one');
                    res.redirect('/admin/users/create');
                }
                else {
                    var newUser = new User(req.body);

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash)=> {
                            newUser.password = hash;
                            newUser.save().then(user => {
                                req.flash('success-message',"Registeration successful");
                                res.redirect('/admin/users');
                            });
                        });
                    });
                }
            });
        }

    },

    editUser: (req, res) => {
        var id = req.params.id;
        User.findById(id)
        .then(user => {
            res.render('admin/users/edit', {User: user});
            
        })
    },

    editUserSubmit: (req, res) => {
    
        const id = req.params.id;
        let errors = [];
        if(!req.body.firstName){
            errors.push({message: 'First Name is mandatory'});
        }
        if(!req.body.lastName){
            errors.push({message: 'Last Name is mandatory'});
        }
        
        if((req.body.password)&&(req.body.password!=req.body.passwordConfirm)){
            errors.push({password: 'Passwords do not match'});
        }
        
        if(errors.length>0){
            User.findById(id)
                .then(user => {
                    res.render('admin/users/edit', {User: user, errors: errors});
            
                })
            
            
        }
        else
        {
            User.findById(id)
                .then(user => {
    
                    user.firstName=req.body.firstName;
                    user.lastName=req.body.lastName;
                    
                    if(req.body.password)
                    {
                    
                    
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(req.body.password, salt, (err, hash)=> {
                                user.password = hash;
                                    user.save().then(updateUser => {
                                    req.flash('success-message', `The User ${updateUser.firstName} ${updateUser.lastName} has been updated.`);
                                    res.redirect('/admin/users');
                                });
                            });
                        });
                    }
                    else
                    {
    
    
                        user.save().then(updateUser => {
                        req.flash('success-message', `The User ${updateUser.firstName} ${updateUser.lastName} has been updated.`);
                        res.redirect('/admin/users');
                                       
                    });
                    }
                });
        }
    },

};