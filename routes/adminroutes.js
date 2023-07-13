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

router.route('/category/edit/:id')
.get(adminController.editCategory)
.post(adminController.editCategorySubmit);

//Levels routes
router.route('/levels')
    .get(adminController.getLevels)
    .post(adminController.createLevels);

router.route('/levels/edit/:id')
    .get(adminController.editLevel)
    .post(adminController.editLevelSubmit);


//subject routes
router.route('/subjects')
    .get(adminController.getSubjects)
    .post(adminController.submitSubjects);

router.route('/subjects/create')
    .get(adminController.createSubjects);

router.route('/subjects/edit/:id')
    .get(adminController.editSubject)
    .put(adminController.editSubjectUpdateRoute);

module.exports = router;