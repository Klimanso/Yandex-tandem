var User = require('models/user').User,
    AuthError = require('models/user').AuthError,
    HttpError = require('error').HttpError;

exports.get = function(req, res){
    if(!req.session.user){
        res.render('login');
    } else {
        res.redirect('editor');
    }
};

exports.post = function(req, res, next){
    var username = req.body.username,
        email = req.body.email,
        password = req.body.password;

    User.authorize(username, email, password, function(err, user){
        if(err){
            if( err instanceof AuthError){
                return next(new HttpError(403, err.message));
            } else {
                return next(err);
            }
        }

        req.session.user = user._id;
        res.send({});
    });
};