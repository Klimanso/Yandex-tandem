var Project = require('models/project').Project,
    ProjError = require('models/project').ProjError,
    HttpError = require('error').HttpError,
    AuthError = require('models/user').AuthError,
    User = require('models/user').User;

exports.post = function(req, res, next){
    if(!req.session.user) return next();

    var projectId = req.body.projectId,
        username= req.body.username,
        email= req.body.email;

    User.search(username, email, function(err, user){
        if(err){
            if( err instanceof AuthError){
                return next(new HttpError(404, err.message));
            } else {
                return next(err);
            }
        }

        Project.assignProject(projectId, user._id,  function(err, project){
            if(err){
                if( err instanceof ProjError){
                    return next(new HttpError(403, err.message));
                } else {
                    return next(err);
                }
            }
            res.send({
                username: user.username,
                _id: user._id,
                photo: user.photo
            });
        });
    });
};