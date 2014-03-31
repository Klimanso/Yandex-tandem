var checkAuth = require('middleware/checkAuth');

module.exports = function(app){
    app.get('/', require('./frontpage').get);

    app.get('/login', require('./user/login').get);
    app.post('/login', require('./user/login').post);

    app.post('/logout', require('./user/logout').post);

    app.get('/registration', require('./user/registration').get);
    app.post('/registration', require('./user/registration').post);

    app.post('/updateUser', require('./user/updateUser').post);

    app.get('/editor', checkAuth, require('./editor').get);

    app.post('/uploadPhoto', require('./user/uploadPhoto').post);
    app.post('/deletePhoto', require('./user/deletePhoto').post);

    app.get('/thumbs', require('./thumbs').get);

    app.post('/setbackground', require('./user/setBackground').post);

    app.post('/project/create', require('./project/createProject').post);
    app.get('/project/delete/:projectId', require('./project/deleteProject').get);
    app.post('/project/assign', require('./project/assignProject').post);
    app.post('/project/unassign', require('./project/unassignProject').post);
    app.get('/project/getassign/:projectId', require('./project/getInfoAssignUsers').get);

    app.post('/task/create', require('./task/createTask').post);
    app.post('/task/update/:taskId', require('./task/updateTask').post);
    app.get('/task/get/:projectId', require('./task/getTasks').get);
    app.get('/task/delete/:taskId', require('./task/deleteTask').get);
    app.get('/task/get/information/:taskId', require('./task/getTaskInformation').get);

    app.post('/comment/add', require('./comment/addComment').post);
};
