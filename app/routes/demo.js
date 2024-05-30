var exec = require('child_process').exec;
var demo_path_base = 'public/files/';
var maxBuffer = 1024 * 1024;

var fs = require('fs');

module.exports = function(app){

	app.post('/scrawler/scripts/:file', function(req, res){
		var filename = req.params.file;
		console.log(filename);
		var check = req.params.file.split('.');
		if(check[check.length-1] == 'py'){
			exec( 'python ' + demo_path_base + filename, { maxBuffer: maxBuffer}, function (error, stdout, stderr) {
				if (!error) {
					res.send({'success':stdout});
				}else{
					res.send({'error':error.message});
				}
				
			});
		}else{
			res.send({'error':'Not supported file type'});
		}
	});

	app.get('/demo', function(req, res){
		var demo = fs.readFileSync('public/demo.html');
		res.write(demo,{title:'Demo'});
		//res.render('dsn',{title:'Demo'});
	})

    app.get('/demo/wordpress', function(req, res){
        res.render('wordpress',{title:'Demo - wordpress'});
    });

    app.get('/demo/trac', function(req, res){
        res.render('trac',{title:'Demo - trac'});
    });

    app.get('/demo/powdertoy', function(req, res){
        res.render('powdertoy',{title:'Demo - powdertoy'});
    });

    
    app.get('/graph', function(req, res){
        res.render('graph');
    });

}