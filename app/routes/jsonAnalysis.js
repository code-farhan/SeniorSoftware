var fs = require('fs');

module.exports = function(app){

    app.get('/centrality/:project/:version/developer', function(req, res){
        var comment_row = fs.readFileSync('public/'+req.params.project+'/centrality_developer_comment_'+ req.params.version +'.json', 'utf-8');
        var comment = JSON.parse(comment_row);
        var commit_row = fs.readFileSync('public/'+req.params.project+'/centrality_developer_commit_'+ req.params.version +'.json', 'utf-8');
        var commit = JSON.parse(commit_row);
        var work_row = fs.readFileSync('public/'+req.params.project+'/centrality_developer_work_'+ req.params.version +'.json', 'utf-8');
        var work = JSON.parse(work_row);
        var SNA = { "CommentCentrality":comment, "CommitCentrality": commit, "WorkCentrality": work};
        res.json(SNA);
    });

    app.get('/centrality/:project/:version/developer/:relation', function(req, res){
        var centrality_row = fs.readFileSync('public/'+req.params.project+'/centrality_developer_'+ req.params.relation +'_'+ req.params.version +'.json', 'utf-8');
        var centrality = JSON.parse(centrality_row);
        var SNA = { "DegreeCentrality":centrality };
        res.json(SNA);
    });

    app.get('/analysis/:project/:version/developer/degree', function(req, res){
        var comment_row = fs.readFileSync('public/'+req.params.project+'/network_developer_comment_'+ req.params.version +'.json', 'utf-8');
        var commit_row = fs.readFileSync('public/'+req.params.project+'/network_developer_commit_'+ req.params.version +'.json', 'utf-8');
        var work_row = fs.readFileSync('public/'+req.params.project+'/network_developer_work_'+ req.params.version +'.json', 'utf-8');
        var developers_row = fs.readFileSync('public/'+req.params.project+'/developer.json','utf-8');
        var developer_comment = JSON.parse(comment_row);
        var developer_commit = JSON.parse(commit_row);
        var developer_work = JSON.parse(work_row);
        var developers = JSON.parse(developers_row);

        var SNA = { "DegreeCentrality":[] };

        for(var j = 0; j < developers.length; j++){
            var comment_count = 0, commit_count = 0, work_count = 0;
            for(var i =0; i< developer_comment.length; i++){
                if(developer_comment[i]['developer1'] == developers[j]['developer'] || developer_comment[i]['developer1'] == developers[j]['developer']){
                    comment_count += developer_comment[i]['count'];
                }
            }
            for(var i =0; i< developer_commit.length; i++){
                if(developer_commit[i]['developer1'] == developers[j]['developer'] || developer_commit[i]['developer1'] == developers[j]['developer']){
                    commit_count += developer_commit[i]['count'];
                }
            }
            for(var i =0; i< developer_work.length; i++){
                if(developer_work[i]['developer1'] == developers[j]['developer'] || developer_work[i]['developer1'] == developers[j]['developer']){
                    work_count += developer_work[i]['count'];
                }
            }
            SNA.DegreeCentrality.push({'name':developers[j]['developer'],'logic':comment_count,'syntax':commit_count,'work':work_count});
        }
        res.json(SNA);
    });

    app.get('/analysis/wordpress/:version/TT/degree', function(req, res){
        var logic_row = fs.readFileSync('public/wordpress/network_TT_logic_'+ req.params.version +'.json', 'utf-8');
        var syntax_row = fs.readFileSync('public/wordpress/network_TT_syntax_'+ req.params.version +'.json', 'utf-8');
        var work_row = fs.readFileSync('public/wordpress/network_TT_work_'+ req.params.version +'.json', 'utf-8');
        var developers_row = fs.readFileSync('public/wordpress/developer.json','utf-8');
        var TT_logic = JSON.parse(logic_row);
        var TT_syntax = JSON.parse(syntax_row);
        var TT_work = JSON.parse(work_row);
        var developers = JSON.parse(developers_row);

        var SNA = { "DegreeCentrality":[] };

        for(var j = 0; j < developers.length; j++){
            var logic_count = 0, syntax_count = 0, work_count = 0;
            for(var i =0; i< TT_logic.length; i++){
                if(TT_logic[i]['developer1'] == developers[j]['developer'] || TT_logic[i]['developer1'] == developers[j]['developer']){
                    logic_count += TT_logic[i]['count'];
                }
            }
            for(var i =0; i< TT_syntax.length; i++){
                if(TT_syntax[i]['developer1'] == developers[j]['developer'] || TT_syntax[i]['developer1'] == developers[j]['developer']){
                    syntax_count += TT_syntax[i]['count'];
                }
            }
            for(var i =0; i< TT_work.length; i++){
                if(TT_work[i]['developer1'] == developers[j]['developer'] || TT_work[i]['developer1'] == developers[j]['developer']){
                    work_count += TT_work[i]['count'];
                }
            }
            SNA.DegreeCentrality.push({'name':developers[j]['developer'],'logic':logic_count,'syntax':syntax_count,'work':work_count});
        }
        res.json(SNA);
    });

    app.get('/analysis/wordpress/:version/developer/degree', function(req, res){
        var comment_row = fs.readFileSync('public/wordpress/network_developer_comment_'+ req.params.version +'.json', 'utf-8');
        var commit_row = fs.readFileSync('public/wordpress/network_developer_commit_'+ req.params.version +'.json', 'utf-8');
        var work_row = fs.readFileSync('public/wordpress/network_developer_work_'+ req.params.version +'.json', 'utf-8');
        var developers_row = fs.readFileSync('public/wordpress/developer.json','utf-8');
        var developer_comment = JSON.parse(comment_row);
        var developer_commit = JSON.parse(commit_row);
        var developer_work = JSON.parse(work_row);
        var developers = JSON.parse(developers_row);

        var SNA = { "DegreeCentrality":[] };

        for(var j = 0; j < developers.length; j++){
            var comment_count = 0, commit_count = 0, work_count = 0;
            for(var i =0; i< developer_comment.length; i++){
                if(developer_comment[i]['developer1'] == developers[j]['developer'] || developer_comment[i]['developer1'] == developers[j]['developer']){
                   comment_count += developer_comment[i]['count'];
                }
            }
            for(var i =0; i< developer_commit.length; i++){
                if(developer_commit[i]['developer1'] == developers[j]['developer'] || developer_commit[i]['developer1'] == developers[j]['developer']){
                    commit_count += developer_commit[i]['count'];
                }
            }
            for(var i =0; i< developer_work.length; i++){
                if(developer_work[i]['developer1'] == developers[j]['developer'] || developer_work[i]['developer1'] == developers[j]['developer']){
                    work_count += developer_work[i]['count'];
                }
            }
            SNA.DegreeCentrality.push({'name':developers[j]['developer'],'logic':comment_count,'syntax':commit_count,'work':work_count});
        }
        res.json(SNA);
    });

    app.post('/:project/mixeddata', function(req, res){
        var mixedData = req.body.mixedData;
        var jsonData_row = fs.readFileSync('public/'+req.params.project+'/circle_developer.json','utf-8');
        var jsonData = JSON.parse(jsonData_row);
        var tempData, tempData_row;
        if( mixedData.activeVersion && mixedData.activeDeveloper ){
            for ( var i =0; i < mixedData.activeVersion.length ;i++){
                for ( var j =0; j < mixedData.activeDeveloper.length ;j++){
                    tempData_row = fs.readFileSync('public/'+req.params.project+'/circle_'+mixedData.activeDeveloper[j]+'_'+mixedData.activeVersion[i]+'.json','utf-8');
                    tempData = JSON.parse(tempData_row);
                    for( var k = 0; k <tempData.links.length; k++){
                        jsonData.links.push(tempData.links[k]);
                    }
                }
            }
        }

        res.send(jsonData);

    });

    app.post('/analysis/mixed/:project/developer/degree', function(req, res){

        var mixedData = req.body.mixedData;
        var tempComment_row, tempComment, tempCommit_row, tempCommit, tempWork_row, tempWork;
        var developer_comment = [];
        var developer_commit = [];
        var developer_work =[];
        var developers_row = fs.readFileSync('public/'+req.params.project+'/developer.json','utf-8');
        var developers = JSON.parse(developers_row);

        for ( var i =0; i < mixedData.activeVersion.length ;i++){
            tempComment_row = fs.readFileSync('public/'+req.params.project+'/network_developer_comment_'+mixedData.activeVersion[i]+'.json','utf-8');
            tempComment = JSON.parse(tempComment_row);
            for( var k = 0; k <tempComment.length; k++){
                developer_comment.push(tempComment[k]);
            }
            tempCommit_row = fs.readFileSync('public/'+req.params.project+'/network_developer_commit_'+mixedData.activeVersion[i]+'.json','utf-8');
            tempCommit = JSON.parse(tempCommit_row);
            for( var k = 0; k <tempCommit.length; k++){
                developer_commit.push(tempCommit[k]);
            }
            tempWork_row = fs.readFileSync('public/'+req.params.project+'/network_developer_work_'+mixedData.activeVersion[i]+'.json','utf-8');
            tempWork = JSON.parse(tempWork_row);
            for( var k = 0; k <tempWork.length; k++){
                developer_work.push(tempWork[k]);
            }
        }


        var SNA = { "DegreeCentrality":[] };

        for(var j = 0; j < developers.length; j++){
            var comment_count = 0, commit_count = 0, work_count = 0;
            for(var i =0; i< developer_comment.length; i++){
                if(developer_comment[i]['developer1'] == developers[j]['developer'] || developer_comment[i]['developer1'] == developers[j]['developer']){
                    comment_count += developer_comment[i]['count'];
                }
            }
            for(var i =0; i< developer_commit.length; i++){
                if(developer_commit[i]['developer1'] == developers[j]['developer'] || developer_commit[i]['developer1'] == developers[j]['developer']){
                    commit_count += developer_commit[i]['count'];
                }
            }
            for(var i =0; i< developer_work.length; i++){
                if(developer_work[i]['developer1'] == developers[j]['developer'] || developer_work[i]['developer1'] == developers[j]['developer']){
                    work_count += developer_work[i]['count'];
                }
            }
            SNA.DegreeCentrality.push({'name':developers[j]['developer'],'logic':comment_count,'syntax':commit_count,'work':work_count});
        }
        res.send(SNA);
    });

}