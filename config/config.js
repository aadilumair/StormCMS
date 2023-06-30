var dotenv = require('dotenv').config();


module.exports = {
    mongoDbUrl: process.env.mongoURL,
    PORT: process.env.PORT|| 8080,
    globalVariables: (req, res, next) => {
        res.locals.success_message = req.flash('success-message');
        res.locals.error_message = req.flash('error-message');
        res.locals.user = req.user || null;
        next();
        
    },
};