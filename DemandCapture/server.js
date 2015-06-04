/* global console */
var path = require('path');
var express = require('express');
var helmet = require('helmet');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var config = require('getconfig');
var semiStatic = require('semi-static');
var serveStatic = require('serve-static');
var app = express();
var sockio = require('socket.io');

// a little helper for fixing paths for various environments
var fixPath = function (pathString) {
    return path.resolve(path.normalize(pathString));
};


// -----------------
// Configure express
// -----------------
app.use(compress());
app.use(serveStatic(fixPath('public')));

// we only want to expose tests in dev
if (config.isDev) {
    app.use(serveStatic(fixPath('test/assets')));
    app.use(serveStatic(fixPath('test/spacemonkey')));
}

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// in order to test this with spacemonkey we need frames
if (!config.isDev) {
    app.use(helmet.xframe());
}
app.use(helmet.xssFilter());
app.use(helmet.nosniff());

app.set('view engine', 'jade');


var api = require('./fakeApi');
app.get('/api/demand', api.list);
app.get('/api/demand/:id', api.get);
app.delete('/api/demand/:id', api.delete);
app.put('/api/demand/:id', api.update);
app.post('/api/demand', api.add);


// -----------------
// Enable the functional test site in development
// -----------------
if (config.isDev) {
    app.get('/test*', semiStatic({
        folderPath: fixPath('test'),
        root: '/test'
    }));
}


// -----------------
// Set our client config cookie
// -----------------
app.use(function (req, res, next) {
    res.cookie('config', JSON.stringify(config.client));
    next();
});


// listen for incoming http requests on the port as specified in our config
var io = sockio.listen(app.listen(config.http.port), nicknames = {});


// on socket connection
io.on('connection', function (socket) {
    console.log('Client Connected with socket id '+socket.id);
    io.emit("demand", {message: 'You are connected to host: '+'http://localhost:' + config.http.port});
});

// export to use in model objects
exports.io = io;

console.log('Demand Capture is running at: http://localhost:' + config.http.port + ' Yep. That\'s pretty awesome.');
