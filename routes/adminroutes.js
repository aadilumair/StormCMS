var express = require("express");
var {isUserAuthenticated} = require ("../config/customFunctions.js");
var router = express.Router();
var adminController = require("../controllers/admincontroller.js");



router.all('/*', isUserAuthenticated, (req, res, next) => {

    req.app.locals.layout = 'admin';

    next();
});


router.route('/')
    .get(adminController.index);

router.route('/posts')
    .get(adminController.getPosts)
    .post(adminController.submitPosts);


router.route('/posts/create')
    .get(adminController.createPosts);

router.route('/posts/edit/:id')
    .get(adminController.editPosts)
    .put(adminController.editPostUpdateRoute);

router.route('/posts/delete/:id')
    .delete(adminController.deletePosts);



//Categories routes

router.route('/categories')
    .get(adminController.getCategories)
    .post(adminController.createCategories);

router.route('/categories/edit/:id')
.get(adminController.editCategory)
.post(adminController.editCategorySubmit);

router.route('/categories/delete/:id')
.delete(adminController.deleteCategories);

//Blog Posts routes

router.route('/blogPosts')
    .get(adminController.getBlogPosts)
    .post(adminController.submitBlogPosts);

router.route('/blogPosts/create')
    .get(adminController.createBlogPosts);

router.route('/blogPosts/edit/:id')
    .get(adminController.editBlogPosts)
    .put(adminController.editBlogPostUpdateRoute);

router.route('/blogPosts/delete/:id')
    .delete(adminController.deleteBlogPosts);

//Levels routes
router.route('/levels')
    .get(adminController.getLevels)
    .post(adminController.createLevels);

router.route('/levels/edit/:id')
    .get(adminController.editLevel)
    .post(adminController.editLevelSubmit);

router.route('/levels/delete/:id')
    .delete(adminController.deleteLevels);

//subject routes
router.route('/subjects')
    .get(adminController.getSubjects)
    .post(adminController.submitSubjects);

router.route('/subjects/create')
    .get(adminController.createSubjects);

router.route('/subjects/edit/:id')
    .get(adminController.editSubject)
    .put(adminController.editSubjectUpdateRoute);

router.route('/subjects/delete/:id')
    .delete(adminController.deleteSubjects);

//chapters
router.route('/chapters')
    .get(adminController.getChapters)
    .post(adminController.submitChapters);


router.route('/chapters/create')
    .get(adminController.createChapters);

router.route('/chapters/edit/:id')
    .get(adminController.editChapter)
    .put(adminController.editChapterSubmit);
    
router.route('/chapters/delete/:id')
    .delete(adminController.deleteChapters);

//file uploads

router.route('/fileuploads')
    .get(adminController.getFiles)
    .post(adminController.submitFiles);

router.route('/fileuploads/create')
    .get(adminController.createFiles);

router.route('/fileuploads/delete/:id')
    .delete(adminController.deleteFiles);

//users

router.route('/users')
    .get(adminController.getUsers)
    .post(adminController.registerPost);

router.route('/users/create')
    .get(adminController.registerGet);

router.route('/users/edit/:id')
    .get(adminController.editUser)
    .post(adminController.editUserSubmit);

router.route('/users/delete/:id')
    .delete(adminController.deleteUsers);



module.exports = router;