
/**
 * Module dependencies.
 */

var express = require('express');


//Server function control
var webcrawler = require('./app/routes/webcrawler.js');
var mysqlToJson = require('./app/routes/mysqlToJson');
var jsonToGraph = require('./app/routes/jsonToGraph');
var jsonAnalysis = require('./app/routes/jsonAnalysis');
var scripts = require('./app/routes/scripts');

var demo = require('./app/routes/demo');


//Web routes control
var routes = require('./app/routes');
var user = require('./app/routes/user');


var mongoose = require('mongoose');
//mongoose.connect('mongodb://root:root@ds063287.mongolab.com:63287/seiorproject');
//mongoose.connect('mongodb://localhost/sellmore3');

var http = require('http');
var path = require('path');

var MongoStore = require('connect-mongo')(express);
var flash = require('connect-flash');

var app = express();

// all environments
app.set('port', process.env.PORT || 7777);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(flash());

app.use(express.favicon('public/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

//app.use(express.cookieParser('cold_smssnd'));
//app.use(express.session({
//    secret: 'cold_smssnd',
//    cookie: { expire: false },
//    store: new MongoStore({
//        mongoose_connection : mongoose.connections[0]
//    })
//}));

app.use(app.router);
//app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


webcrawler(app);
mysqlToJson(app);
jsonToGraph(app);
jsonAnalysis(app);
scripts(app);
demo(app);

routes(app);

var server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
//
//var io = require('socket.io').listen(server);
//
//exports.sio = io;
//
//
//io.sockets.on('connection', function (socket) {
//
//
//    socket.on('my other event', function (data) {
//        console.log(data);
//    });
//
//  	socket.on('say', function (data) {
//	    socket.broadcast.emit('broadcast_say',{
//	        text: data.text
//	    });
//        socket.emit('sayhi', { hello: 'world' });
//	});
//
//});
