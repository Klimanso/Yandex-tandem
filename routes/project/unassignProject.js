var Project = require('models/project').Project,
    ProjError = require('models/project').ProjError,
    HttpError = require('error').HttpError,
    AuthError = require('models/user').AuthError,
    User = require('models/user').User;

exports.post = function(req, res, next){
    if(!req.session.user) return next();

    var projectId = req.body.projectId,
        userId= req.body.userId;

    Project.unassignProject(projectId, userId,  function(err, project){
        if(err){
            if( err instanceof ProjError){
                return next(new HttpError(403, err.message));
            } else {
                return next(err);
            }
        }
        res.send({});
    });
};