module.exports = {
    selectOption : function(status, options) {
        return options.fn(this).replace(new RegExp('value=\"'+status+'\"'), '$&selected="selected"');
    },

    isEmpty: function (obj) {
        for(let key in obj) {
            if(Object.hasOwn(obj, key)) {
                return false;
            }
        }
        
        return true;
    },

    isUserAuthenticated: (req, res, next) => {
        if (req.isAuthenticated()) {
            next();
        }
        else {
            res.redirect('/login');
        }
    }
};