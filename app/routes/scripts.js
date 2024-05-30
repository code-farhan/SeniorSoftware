var exec = require('child_process').exec;

var scripts_base = 'app/subservice/'
var maxBuffer = 1024 * 1024;

module.exports = function(app){

		app.post('/scripts/:language/:file', function(req, res){
		var filename = req.params.file;
		var script_language = req.params.language;
		console.log(filename);
		var check = req.params.file.split('.');
		if(check[check.length-1] == 'py' && script_language == 'python'){
			exec(  'python ' + scripts_base + filename, { maxBuffer: maxBuffer}, function (error, stdout, stderr) {
				//console.log(stdout);
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

}