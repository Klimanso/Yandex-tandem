var Project = require('models/project').Project,
    ProjError = require('models/project').ProjError,
    HttpError = require('error').HttpError,
    AuthError = require('models/user').AuthError,
    User = require('models/user').User;

exports.get = function(req, res, next){
    if(!req.session.user) return next();

    var projectId = req.param('projectId');

    Project.findById(projectId, function(err, project){
        if(err){
            return next(err);
        } else {
            User.find({
                '_id': {
                    $in: project.assignedUsers
                }
            }, function(err, users){
                if(err){
                    next(err);
                } else {
                    var userInfo = [];
                    for(var index = 0 ; index < users.length; index++){
                        userInfo.push({
                            _id: users[index]._id,
                            username: users[index].username,
                            photo: users[index].photo
                        })
                    }

                    res.send(userInfo);
                }
            });
        }
    });
};