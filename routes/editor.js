exports.get = function(req, res, next){
    res.render('editor', {
        user: req.user,
        projects: JSON.stringify(req.projects)
    });
};