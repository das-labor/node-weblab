var conf = require('./config.js');

var express = require('express');
var compress = require('compression');
var methodOverride = require('method-override');
var app = express();
http = require('http'),
    server = http.createServer(app);

var oneDay = 86400000;

app.use(methodOverride());
app.use(compress());
app.use(express.static(__dirname + '/public', {maxAge: oneDay}));

// pug setup
app.set('view engine', 'pug'); // Set pug as default render engine
app.locals.pretty = true; // format output of pug

app.get('/', function (req, res) {
    res.render('desktop', {
        pagetitle: "Webinterface",
        rooms: conf.rooms,
    });
});

app.get('/mobile', function (req, res) {
    res.render('mobile', {
        pagetitle: "Webinterface",
        rooms: conf.rooms,
    });
});

server.listen(conf.global.httpport, '::');

exports.server = server;
