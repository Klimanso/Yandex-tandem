var express = require('express');
var app = express();
var http = require('http');
var path = require('path');
var config = require('config');
var mongoose = require('libs/mongoose');
var log = require('libs/log')(module);
var HttpError = require('error').HttpError;

app.set('port', process.env.PORT || config.get('port'));

app.engine('ejs', require('ejs-locals'));
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'ejs');

app.use(express.favicon());
app.use(express.logger('dev'));

app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(express.cookieParser('your secret here'));

var MongoStore = require('connect-mongo')(express);

app.use(express.session({
    secret: config.get('session:secret'),
    key: config.get('session:key'),
    cookie: config.get('session:cookie'),
    store: new MongoStore({ mongoose_connection: mongoose.connection })
})); // connect.sid

app.use(require('middleware/sendHttpError'));
app.use(require('middleware/loadUser'));
app.use(require('middleware/loadUserProjects'));

app.use(app.router);

require('routes')(app);

app.use('/', express.static(path.join(__dirname, '/public')));

app.use(function(err, req, res, next){
    if(typeof err == 'number'){
        err = new HttpError(err);
    }

    if(err instanceof HttpError){
        res.sendHttpError(err);
    } else {
        if(app.get('env') == 'development') {
            express.errorHandler() (err, req, res, next);
        } else {
            log.error(err);
            err = new HttpError(500);
            res.sendHttpError(err);
        }
    }
});

http.createServer(app).listen(app.get('port'), function(){
    log.info('Express server listening on port ' + config.get('port'));
});

