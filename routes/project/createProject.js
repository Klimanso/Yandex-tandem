var Project = require('models/project').Project,
    ProjError = require('models/project').ProjError,
    HttpError = require('error').HttpError;

exports.post = function(req, res, next){
    if(!req.session.user) return next();

    var projectname = req.body.projectname;

    Project.newProject(projectname, req.user._id, function(err, project){
        if(err){
            if( err instanceof ProjError){
                return next(new HttpError(403, err.message));
            } else {
                return next(err);
            }
        }
        res.send(project);
    });
};