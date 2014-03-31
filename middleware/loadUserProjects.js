var Project = require('./../models/project').Project;

module.exports = function(req, res, next) {
    req.projects = res.locals.projects = null;
    if(!req.session.user) return next();

    Project.find({ assignedUsers: req.session.user }, function(err, projects) {
        if(err) return next(err);

        req.projects = res.locals.projects = projects;
        next();
    });
};