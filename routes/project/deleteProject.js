var Project = require('./../../models/project').Project,
    ProjError = require('./../../models/project').ProjError,
    HttpError = require('./../../error').HttpError,
    Task = require('./../../models/task').Task;

exports.get = function(req, res, next){
    if(!req.session.user) return next();

    var projectId = req.param('projectId');

    Project.deleteProject(projectId, function(err, project){
        if(err){
            if( err instanceof ProjError){
                return next(new HttpError(403, err.message));
            } else {
                return next(err);
            }
        }
        Task.deleteAllofProject(projectId, function(err, tasks){
            if(err){
                return next(err);
            }
            res.send({});
        });
    });
};