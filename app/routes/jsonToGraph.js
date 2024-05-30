var fs = require('fs');

module.exports = function(app){

    app.post('/transform/:project/file/logic/circle/:version', function(req, res){

        var source,target,value;

        var network_row = fs.readFileSync('public/'+req.params.project+'/network_file_logic_'+ req.params.version +'.json', 'utf-8');
        var files_row = fs.readFileSync('public/'+req.params.project+'/file.json','utf-8');
        var network = JSON.parse(network_row);
        var files = JSON.parse(files_row);
        var graph = { "nodes":[],"links":[]};
        for( var i = 0; i< files.length; i++){
            graph.nodes.push({"name":files[i]['file'],"group":1});
        }
        for( var i = 0; i< network.length; i++){

            for( var j = 0; j< files.length; j++){
                //console.log(network[i]['file1']+' '+network[i]['file2']+' '+files[j]['file']);
                if( network[i]['file1'] == files[j]['file'])
                    source = files[j]['numbers'];
                if( network[i]['file2'] == files[j]['file'])
                    target = files[j]['numbers'];
            }
            graph.links.push({"source":source,"target":target,"value":network[i]['count']});
        }
        fs.writeFile('public/'+req.params.project+'/circle_file_logic_'+req.params.version+'.json',JSON.stringify(graph,null,4), function(err){
            if(err){
                throw err;
                res.send({'error':err.message});
            }else{
                res.send({
                    'success': true
                });
            }
        })
    });

    app.post('/transform/:project/file/syntax/circle/:version', function(req, res){

        var source,target,value;

        var network_row = fs.readFileSync('public/'+req.params.project+'/network_file_syntax_'+ req.params.version +'.json', 'utf-8');
        var files_row = fs.readFileSync('public/'+req.params.project+'/file.json','utf-8');
        var network = JSON.parse(network_row);
        var files = JSON.parse(files_row);
        var graph = { "nodes":[],"links":[]};
        for( var i = 0; i< files.length; i++){
            graph.nodes.push({"name":files[i]['file'],"group":1});
        }
        for( var i = 0; i< network.length; i++){

            for( var j = 0; j< files.length; j++){
                //console.log(network[i]['file1']+' '+network[i]['file2']+' '+files[j]['file']);
                if( network[i]['file1'] == files[j]['file'])
                    source = files[j]['numbers'];
                if( network[i]['file2'] == files[j]['file'])
                    target = files[j]['numbers'];
            }
            graph.links.push({"source":source,"target":target,"value":network[i]['count']});
        }
        fs.writeFile('public/'+req.params.project+'/circle_file_syntax_'+req.params.version+'.json',JSON.stringify(graph,null,4), function(err){
            if(err){
                throw err;
                res.send({'error':err.message});
            }else{
                res.send({
                    'success': true
                });
            }
        })
    });

    app.post('/transform/:project/file/work/circle/:version', function(req, res){

        var source,target,value;

        var network_row = fs.readFileSync('public/'+req.params.project+'/network_file_work_'+ req.params.version +'.json', 'utf-8');
        var files_row = fs.readFileSync('public/'+req.params.project+'/file.json','utf-8');
        var network = JSON.parse(network_row);
        var files = JSON.parse(files_row);
        var graph = { "nodes":[],"links":[]};
        for( var i = 0; i< files.length; i++){
            graph.nodes.push({"name":files[i]['file'],"group":1});
        }
        for( var i = 0; i< network.length; i++){

            for( var j = 0; j< files.length; j++){
                //console.log(network[i]['file1']+' '+network[i]['file2']+' '+files[j]['file']);
                if( network[i]['file1'] == files[j]['file'])
                    source = files[j]['numbers'];
                if( network[i]['file2'] == files[j]['file'])
                    target = files[j]['numbers'];
            }
            graph.links.push({"source":source,"target":target,"value":network[i]['count']});
        }
        fs.writeFile('public/'+req.params.project+'/circle_file_work_'+req.params.version+'.json',JSON.stringify(graph,null,4), function(err){
            if(err){
                throw err;
                res.send({'error':err.message});
            }else{
                res.send({
                    'success': true
                });
            }
        })
    });


    app.post('/transform/:project/developer/comment/circle/:version', function(req, res){

        var source,target,value;

        var network_row = fs.readFileSync('public/'+req.params.project+'/network_developer_comment_'+ req.params.version +'.json', 'utf-8');
        var developers_row = fs.readFileSync('public/'+req.params.project+'/developer.json','utf-8');
        var network = JSON.parse(network_row);
        var developers = JSON.parse(developers_row);
        var graph = { "nodes":[],"links":[]};
        for( var i = 0; i< developers.length; i++){
            graph.nodes.push({"name":developers[i]['developer'],"group":developers[i]['number']});
        }
        for( var i = 0; i< network.length; i++){
            source = -1;
            target = -1;
            for( var j = 0; j< developers.length; j++){
                if( network[i]['developer1'] == developers[j]['developer'])
                    source = developers[j]['number'];
                if( network[i]['developer2'] == developers[j]['developer'])
                    target = developers[j]['number'];
            }
            if( source != -1 && target != -1)
                graph.links.push({"source":source,"target":target,"value":network[i]['count']});
        }
        fs.writeFile('public/'+req.params.project+'/circle_developer_comment_'+req.params.version+'.json',JSON.stringify(graph,null,4), function(err){
            if(err){
                throw err;
                res.send({'error':err.message});
            }else{
                res.send({
                    'success': true
                });
            }
        })
    });

    app.post('/transform/:project/developer/commit/circle/:version', function(req, res){

        var source,target,value;

        var network_row = fs.readFileSync('public/'+req.params.project+'/network_developer_commit_'+ req.params.version +'.json', 'utf-8');
        var developers_row = fs.readFileSync('public/'+req.params.project+'/developer.json','utf-8');
        var network = JSON.parse(network_row);
        var developers = JSON.parse(developers_row);
        var graph = { "nodes":[],"links":[]};
        for( var i = 0; i< developers.length; i++){
            graph.nodes.push({"name":developers[i]['developer'],"group":developers[i]['number']});
        }
        for( var i = 0; i< network.length; i++){
            for( var j = 0; j< developers.length; j++){
                if( network[i]['developer1'] == developers[j]['developer'])
                    source = developers[j]['number'];
                if( network[i]['developer2'] == developers[j]['developer'])
                    target = developers[j]['number'];
            }
            graph.links.push({"source":source,"target":target,"value":network[i]['count']});
        }
        fs.writeFile('public/'+req.params.project+'/circle_developer_commit_'+req.params.version+'.json',JSON.stringify(graph,null,4), function(err){
            if(err){
                throw err;
                res.send({'error':err.message});
            }else{
                res.send({
                    'success': true
                });
            }
        })
    });

    app.post('/transform/:project/developer/work/circle/:version', function(req, res){

        var source,target,value;

        var network_row = fs.readFileSync('public/'+req.params.project+'/network_developer_work_'+ req.params.version +'.json', 'utf-8');
        var developers_row = fs.readFileSync('public/'+req.params.project+'/developer.json','utf-8');
        var network = JSON.parse(network_row);
        var developers = JSON.parse(developers_row);
        var graph = { "nodes":[],"links":[]};
        for( var i = 0; i< developers.length; i++){
            graph.nodes.push({"name":developers[i]['developer'],"group":developers[i]['number']});
        }
        for( var i = 0; i< network.length; i++){
            for( var j = 0; j< developers.length; j++){
                if( network[i]['developer1'] == developers[j]['developer'])
                    source = developers[j]['number'];
                if( network[i]['developer2'] == developers[j]['developer'])
                    target = developers[j]['number'];
            }
            graph.links.push({"source":source,"target":target,"value":network[i]['count']});
        }
        fs.writeFile('public/'+req.params.project+'/circle_developer_work_'+req.params.version+'.json',JSON.stringify(graph,null,4), function(err){
            if(err){
                throw err;
                res.send({'error':err.message});
            }else{
                res.send({
                    'success': true
                });
            }
        })
    });

    // for wordpress demo


    app.post('/transform/wordress/file/logic/circle/:version', function(req, res){

        var source,target,value;

        var network_row = fs.readFileSync('public/'+req.params.project+'/network_file_logic_'+ req.params.version +'.json', 'utf-8');
        var files_row = fs.readFileSync('public/'+req.params.project+'/file.json','utf-8');
        var network = JSON.parse(network_row);
        var files = JSON.parse(files_row);
        var graph = { "nodes":[],"links":[]};
        for( var i = 0; i< files.length; i++){
            graph.nodes.push({"name":files[i]['file'],"group":1});
        }
        for( var i = 0; i< network.length; i++){

            for( var j = 0; j< files.length; j++){
                //console.log(network[i]['file1']+' '+network[i]['file2']+' '+files[j]['file']);
                if( network[i]['file1'] == files[j]['file'])
                    source = files[j]['numbers'];
                if( network[i]['file2'] == files[j]['file'])
                    target = files[j]['numbers'];
            }
            graph.links.push({"source":source,"target":target,"value":network[i]['count']});
        }
        fs.writeFile('public/'+req.params.project+'/circle_file_logic_'+req.params.version+'.json',JSON.stringify(graph,null,4), function(err){
            if(err){
                throw err;
                res.send({'error':err.message});
            }else{
                res.send({
                    'success': true
                });
            }
        })
    });

    app.post('/transform/wordpress/file/syntax/circle/:version', function(req, res){

        var source,target,value;

        var network_row = fs.readFileSync('public/wordpress/network_file_syntax_'+ req.params.version +'.json', 'utf-8');
        var files_row = fs.readFileSync('public/wordpress/file.json','utf-8');
        var network = JSON.parse(network_row);
        var files = JSON.parse(files_row);
        var graph = { "nodes":[],"links":[]};
        for( var i = 0; i< files.length; i++){
            graph.nodes.push({"name":files[i]['file'],"group":1});
        }
        for( var i = 0; i< network.length; i++){

            for( var j = 0; j< files.length; j++){
                //console.log(network[i]['file1']+' '+network[i]['file2']+' '+files[j]['file']);
                if( network[i]['file1'] == files[j]['file'])
                    source = files[j]['numbers'];
                if( network[i]['file2'] == files[j]['file'])
                    target = files[j]['numbers'];
            }
            graph.links.push({"source":source,"target":target,"value":network[i]['count']});
        }
        fs.writeFile('public/wordpress/circle_file_syntax_'+req.params.version+'.json',JSON.stringify(graph,null,4), function(err){
            if(err){
                throw err;
                res.send({'error':err.message});
            }else{
                res.send({
                    'success': true
                });
            }
        })
    });



    app.post('/transform/wordpress/file/work/circle/:version', function(req, res){

        var source,target,value;

        var network_row = fs.readFileSync('public/wordpress/network_file_work_'+ req.params.version +'.json', 'utf-8');
        var files_row = fs.readFileSync('public/wordpress/file.json','utf-8');
        var network = JSON.parse(network_row);
        var files = JSON.parse(files_row);
        var graph = { "nodes":[],"links":[]};
        for( var i = 0; i< files.length; i++){
            graph.nodes.push({"name":files[i]['file'],"group":1});
        }
        for( var i = 0; i< network.length; i++){

            for( var j = 0; j< files.length; j++){
                //console.log(network[i]['file1']+' '+network[i]['file2']+' '+files[j]['file']);
                if( network[i]['file1'] == files[j]['file'])
                    source = files[j]['numbers'];
                if( network[i]['file2'] == files[j]['file'])
                    target = files[j]['numbers'];
            }
            graph.links.push({"source":source,"target":target,"value":network[i]['count']});
        }
        fs.writeFile('public/wordpress/circle_file_work_'+req.params.version+'.json',JSON.stringify(graph,null,4), function(err){
            if(err){
                throw err;
                res.send({'error':err.message});
            }else{
                res.send({
                    'success': true
                });
            }
        })
    });





    app.post('/transform/wordpress/developer/comment/circle/:version', function(req, res){

        var source,target,value;

		var network_row = fs.readFileSync('public/wordpress/network_developer_comment_'+ req.params.version +'.json', 'utf-8');
        var developers_row = fs.readFileSync('public/wordpress/developer.json','utf-8');
        var network = JSON.parse(network_row);
        var developers = JSON.parse(developers_row);
        var graph = { "nodes":[],"links":[]};
        for( var i = 0; i< developers.length; i++){
            graph.nodes.push({"name":developers[i]['developer'],"group":developers[i]['number']});
        }
        for( var i = 0; i< network.length; i++){
            source = -1;
            target = -1;
            for( var j = 0; j< developers.length; j++){
                if( network[i]['developer1'] == developers[j]['developer'])
                    source = developers[j]['number'];
                if( network[i]['developer2'] == developers[j]['developer'])
                    target = developers[j]['number'];
            }
            if( source != -1 && target != -1)
                graph.links.push({"source":source,"target":target,"value":network[i]['count']});
        }
        fs.writeFile('public/wordpress/circle_developer_comment_'+req.params.version+'.json',JSON.stringify(graph,null,4), function(err){
            if(err){
                throw err;
                res.send({'error':err.message});
            }else{
                res.send({
                    'success': true
                });
            }
        })
	});

    app.post('/transform/wordpress/developer/commit/circle/:version', function(req, res){

        var source,target,value;

        var network_row = fs.readFileSync('public/wordpress/network_developer_commit_'+ req.params.version +'.json', 'utf-8');
        var developers_row = fs.readFileSync('public/wordpress/developer.json','utf-8');
        var network = JSON.parse(network_row);
        var developers = JSON.parse(developers_row);
        var graph = { "nodes":[],"links":[]};
        for( var i = 0; i< developers.length; i++){
            graph.nodes.push({"name":developers[i]['developer'],"group":developers[i]['number']});
        }
        for( var i = 0; i< network.length; i++){
            for( var j = 0; j< developers.length; j++){
                if( network[i]['developer1'] == developers[j]['developer'])
                    source = developers[j]['number'];
                if( network[i]['developer2'] == developers[j]['developer'])
                    target = developers[j]['number'];
            }
            graph.links.push({"source":source,"target":target,"value":network[i]['count']});
        }
        fs.writeFile('public/wordpress/circle_developer_commit_'+req.params.version+'.json',JSON.stringify(graph,null,4), function(err){
            if(err){
                throw err;
                res.send({'error':err.message});
            }else{
                res.send({
                    'success': true
                });
            }
        })
    });

    app.post('/transform/wordpress/developer/work/circle/:version', function(req, res){

        var source,target,value;

        var network_row = fs.readFileSync('public/wordpress/network_developer_work_'+ req.params.version +'.json', 'utf-8');
        var developers_row = fs.readFileSync('public/wordpress/developer.json','utf-8');
        var network = JSON.parse(network_row);
        var developers = JSON.parse(developers_row);
        var graph = { "nodes":[],"links":[]};
        for( var i = 0; i< developers.length; i++){
            graph.nodes.push({"name":developers[i]['developer'],"group":developers[i]['number']});
        }
        for( var i = 0; i< network.length; i++){
            for( var j = 0; j< developers.length; j++){
                if( network[i]['developer1'] == developers[j]['developer'])
                    source = developers[j]['number'];
                if( network[i]['developer2'] == developers[j]['developer'])
                    target = developers[j]['number'];
            }
            graph.links.push({"source":source,"target":target,"value":network[i]['count']});
        }
        fs.writeFile('public/wordpress/circle_developer_work_'+req.params.version+'.json',JSON.stringify(graph,null,4), function(err){
            if(err){
                throw err;
                res.send({'error':err.message});
            }else{
                res.send({
                    'success': true
                });
            }
        })
    });


    app.post('/transform/wordpress/TT/logic/circle/:version', function(req, res){

        var source,target,value;

        var network_row = fs.readFileSync('public/wordpress/network_TT_logic_'+ req.params.version +'.json', 'utf-8');
        var developers_row = fs.readFileSync('public/wordpress/developer.json','utf-8');
        var network = JSON.parse(network_row);
        var developers = JSON.parse(developers_row);
        var graph = { "nodes":[],"links":[]};
        for( var i = 0; i< developers.length; i++){
            graph.nodes.push({"name":developers[i]['developer'],"group":developers[i]['number']});
        }
        for( var i = 0; i< network.length; i++){
            for( var j = 0; j< developers.length; j++){
                if( network[i]['developer1'] == developers[j]['developer'])
                    source = developers[j]['number'];
                if( network[i]['developer2'] == developers[j]['developer'])
                    target = developers[j]['number'];
            }
            graph.links.push({"source":source,"target":target,"value":network[i]['count']});
        }
        fs.writeFile('public/wordpress/circle_TT_logic_'+req.params.version+'.json',JSON.stringify(graph,null,4), function(err){
            if(err){
                throw err;
                res.send({'error':err.message});
            }else{
                res.send({
                    'success': true
                });
            }
        })
    });

    app.post('/transform/wordpress/TT/syntax/circle/:version', function(req, res){

        var source,target,value;

        var network_row = fs.readFileSync('public/wordpress/network_TT_syntax_'+ req.params.version +'.json', 'utf-8');
        var developers_row = fs.readFileSync('public/wordpress/developer.json','utf-8');
        var network = JSON.parse(network_row);
        var developers = JSON.parse(developers_row);
        var graph = { "nodes":[],"links":[]};
        for( var i = 0; i< developers.length; i++){
            graph.nodes.push({"name":developers[i]['developer'],"group":developers[i]['number']});
        }
        for( var i = 0; i< network.length; i++){
            for( var j = 0; j< developers.length; j++){
                if( network[i]['developer1'] == developers[j]['developer'])
                    source = developers[j]['number'];
                if( network[i]['developer2'] == developers[j]['developer'])
                    target = developers[j]['number'];
            }
            graph.links.push({"source":source,"target":target,"value":network[i]['count']});
        }
        fs.writeFile('public/wordpress/circle_TT_syntax_'+req.params.version+'.json',JSON.stringify(graph,null,4), function(err){
            if(err){
                throw err;
                res.send({'error':err.message});
            }else{
                res.send({
                    'success': true
                });
            }
        })
    });

    app.post('/transform/wordpress/TT/work/circle/:version', function(req, res){

        var source,target,value;

        var network_row = fs.readFileSync('public/wordpress/network_TT_work_'+ req.params.version +'.json', 'utf-8');
        var developers_row = fs.readFileSync('public/wordpress/developer.json','utf-8');
        var network = JSON.parse(network_row);
        var developers = JSON.parse(developers_row);
        var graph = { "nodes":[],"links":[]};
        for( var i = 0; i< developers.length; i++){
            graph.nodes.push({"name":developers[i]['developer'],"group":developers[i]['number']});
        }
        for( var i = 0; i< network.length; i++){
            for( var j = 0; j< developers.length; j++){
                if( network[i]['developer1'] == developers[j]['developer'])
                    source = developers[j]['number'];
                if( network[i]['developer2'] == developers[j]['developer'])
                    target = developers[j]['number'];
            }
            graph.links.push({"source":source,"target":target,"value":network[i]['count']});
        }
        fs.writeFile('public/wordpress/circle_TT_work_'+req.params.version+'.json',JSON.stringify(graph,null,4), function(err){
            if(err){
                throw err;
                res.send({'error':err.message});
            }else{
                res.send({
                    'success': true
                });
            }
        })
    });



    app.post('/transform/wordpress/developer/comment/label/:version', function(req, res){

        var source,target,value;

        var network_row = fs.readFileSync('public/wordpress/network_developer_comment_'+ req.params.version +'.json', 'utf-8');
        var developers_row = fs.readFileSync('public/wordpress/developer.json','utf-8');
        var network = JSON.parse(network_row);
        var developers = JSON.parse(developers_row);
        var graph = { "nodes":[],"links":[],"labelAnchors":[],"labelAnchorLinks":[]};
        for( var i = 0; i< developers.length; i++){
            var node = {
                "label" : developers[i]['developer']
            };
            graph.nodes.push(node);
            graph.labelAnchors.push({
                "node" : node
            });
            graph.labelAnchors.push({
                "node" : node
            });
        }
        for( var i = 0; i< network.length; i++){
            for( var j = 0; j< developers.length; j++){
                if( network[i]['developer1'] == developers[j]['developer'])
                    source = developers[j]['number'];
                if( network[i]['developer2'] == developers[j]['developer'])
                    target = developers[j]['number'];
            }
            graph.links.push({
                "source":source,
                "target":target,
                "weight":0.95+Math.random()*0.05//network[i]['count']/117
            });
            graph.labelAnchorLinks.push({
                "source" : source * 2,
                "target" : target * 2 + 1,
                "weight" : 1
            });
        }
        fs.writeFile('public/wordpress/label_developer_comment_'+req.params.version+'.json',JSON.stringify(graph,null,4), function(err){
            if(err){
                throw err;
                res.send({'error':err.message});
            }else{
                res.send({
                    'success': true
                });
            }
        })
    });


}