/*
    Web Page control
 */

var io = require('socket.io');


module.exports = function(app){



    app.get('/', function(req, res){

        res.render('index', { title: 'SeniorProject - DSN' });

    });

    app.get('/project', function(req, res){
        res.render('demo', { title: 'demo' });

    });

    app.get('/project/crawler', function(req, res){
        res.render('crawler', { title: 'crawler' });

    });

    app.get('/project/relations', function(req, res){
        res.render('relations', { title: 'crawler' });
    });

    app.get('/project/diagram', function(req, res){
        res.render('diagram', { title: 'crawler' });
    });



    app.get('/test', function(req, res){
    	console.log('test');
        res.render('index', { title: 'SmsSnd' });

    });


    app.get('/test',function(req,res){
        var http =  require('http');
        var url = "http://foolkite.github.io";
        http.get(url, function(res) {
            var source = "";
            //通过 get 请求获取网页代码 source
            res.on('data', function(data) {
                source += data;
            });
            //获取到数据 source，我们可以对数据进行操作了!
            res.on('end', function() {
                console.log(source);
                var cheerio = require('cheerio'),
                $ = cheerio.load(source);
                $('h1').addClass('welcome');
                console.log($.children);

            });
        }).on('error', function() {
                console.log("获取数据出现错误");
            });

        res.send({"result":1});
    })

    app.post('/sqlget', function(req, res){
        var test = req.body.test;
        console.log(req.body.test);
        console.log(test);
        res.send({'hello':test});
    });

//    app.get('*', function(req, res){
//        res.render('404', { title: 'SmsSnd' });
//    });

}
