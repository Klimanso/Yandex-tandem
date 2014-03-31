var fs = require('fs'),
    path = require('path');

exports.get = function(req, res, next){
    fs.readdir(path.join(__dirname, '../public/images/backgrounds/thumbs/') , function(err, files){
        if(err) next(err);
        res.send({
            files: files,
            path: '/images/backgrounds/thumbs/'
        });
    });
};