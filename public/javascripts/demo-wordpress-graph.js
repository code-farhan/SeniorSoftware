/*! data visualization | (c) 2014 Jintian Gao */

var table_base = '<tr><th>开发者姓名</th><th>逻辑依赖关系-DegreeCentrality</th><th>语法依赖关系-DegreeCentrality</th><th>工作依赖关系-DegreeCentrality</th></tr>';

//记录平行数据表的data，用于从关系网路向图表跳转
var currentParallelData;
//记录关系网络的data，用于从图表向关系网路跳转
var currentNetworkData;
//记录跳转过去的平行表格节点的 平行数据下的开发者序列号
var activeParallelNode;
//记录跳转过去的关系网络图节点的 开发者姓名
var activeNetworkNode;


//初始化平行表格需要的方法
!function(){
    var bP={};  
    var b=30, bb=200, height=600, buffMargin=1, minHeight=14;
    var c1=[-120, 40], c2=[-90, 100], c3=[ 140, 140]; //左边栏三列数据的位置
    var colors =["#3366CC", "#DC3912",  "#FF9900","#109618", "#990099", "#0099C6"];
    
    bP.partData = function(data,p){
        var sData={};
        
        sData.keys=[
            d3.set(data.map(function(d){ return d[0];})).values().sort(function(a,b){ return ( a<b? -1 : a>b ? 1 : 0);}),
            d3.set(data.map(function(d){ return d[1];})).values().sort(function(a,b){ return ( a<b? -1 : a>b ? 1 : 0);})        
        ];
        
        sData.data = [  
            sData.keys[0].map( function(d){ return sData.keys[1].map( function(v){ return 0; }); }),
            sData.keys[1].map( function(d){ return sData.keys[0].map( function(v){ return 0; }); }) 
        ];
        
        data.forEach(function(d){ 
            sData.data[0][sData.keys[0].indexOf(d[0])][sData.keys[1].indexOf(d[1])]=d[p];
            sData.data[1][sData.keys[1].indexOf(d[1])][sData.keys[0].indexOf(d[0])]=d[p]; 
        });
        
        return sData;
    }
    
    function visualize(data){
        var vis ={};
        function calculatePosition(a, s, e, b, m){
            var total=d3.sum(a);
            var sum=0, neededHeight=0, leftoverHeight= e-s-2*b*a.length;
            var ret =[];
            
            a.forEach(
                function(d){ 
                    var v={};
                    v.percent = (total == 0 ? 0 : d/total); 
                    v.value=d;
                    v.height=Math.max(v.percent*(e-s-2*b*a.length), m);
                    (v.height==m ? leftoverHeight-=m : neededHeight+=v.height );
                    ret.push(v);
                }
            );
            
            var scaleFact=leftoverHeight/Math.max(neededHeight,1), sum=0;
            
            ret.forEach(
                function(d){ 
                    d.percent = scaleFact*d.percent; 
                    d.height=(d.height==m? m : d.height*scaleFact);
                    d.middle=sum+b+d.height/2;
                    d.y=s + d.middle - d.percent*(e-s-2*b*a.length)/2;
                    d.h= d.percent*(e-s-2*b*a.length);
                    d.percent = (total == 0 ? 0 : d.value/total);
                    sum+=2*b+d.height;
                }
            );
            return ret;
        }

        vis.mainBars = [ 
            calculatePosition( data.data[0].map(function(d){ return d3.sum(d);}), 0, height, buffMargin, minHeight),
            calculatePosition( data.data[1].map(function(d){ return d3.sum(d);}), 0, height, buffMargin, minHeight)
        ];
        
        vis.subBars = [[],[]];
        vis.mainBars.forEach(function(pos,p){
            pos.forEach(function(bar, i){   
                calculatePosition(data.data[p][i], bar.y, bar.y+bar.h, 0, 0).forEach(function(sBar,j){ 
                    sBar.key1=(p==0 ? i : j); 
                    sBar.key2=(p==0 ? j : i); 
                    vis.subBars[p].push(sBar); 
                });
            });
        });
        vis.subBars.forEach(function(sBar){
            sBar.sort(function(a,b){ 
                return (a.key1 < b.key1 ? -1 : a.key1 > b.key1 ? 
                        1 : a.key2 < b.key2 ? -1 : a.key2 > b.key2 ? 1: 0 )});
        });
        
        vis.edges = vis.subBars[0].map(function(p,i){
            return {
                key1: p.key1,
                key2: p.key2,
                y1:p.y,
                y2:vis.subBars[1][i].y,
                h1:p.h,
                h2:vis.subBars[1][i].h
            };
        });
        vis.keys=data.keys;
        return vis;
    }
    
    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
            return edgePolygon(i(t));
        };
    }
    
    //初始化图
    function drawPart(data, id, p){
        d3.select("#"+id).append("g").attr("class","part"+p)
            .attr("transform","translate("+( p%2*(bb+b) )+",0)");
        d3.select("#"+id).select(".part"+p).append("g").attr("class","subbars");
        d3.select("#"+id).select(".part"+p).append("g").attr("class","mainbars");
        
        var mainbar = d3.select("#"+id).select(".part"+p).select(".mainbars")
            .selectAll(".mainbar").data(data.mainBars[p])
            .enter().append("g").attr("class","mainbar");

        mainbar.append("rect").attr("class","mainrect")
            .attr("x", 0).attr("y",function(d){ return d.middle-d.height/2; })
            .attr("width",b).attr("height",function(d){ return d.height; })
            .style("shape-rendering","auto")
            .style("fill-opacity",0).style("stroke-width","0.5")
            .style("stroke","black").style("stroke-opacity",0);
            
        mainbar.append("text").attr("class","barlabel")
            .attr("x", c1[p]).attr("y",function(d){ return d.middle+5;})
            .text(function(d,i){ return data.keys[p][i];})
            .attr("text-anchor","start" )
            .style("fill","#428bca")
            .attr("id",function(d,i){ return "parallel-"+data.keys[p][i];})
            .on('click', function(d,i){
            //图表点到关联图的跳转和数据的弹出          
                //document.location.href = "#graph";
                $('#evolution-tab a:first').tab('show');
                $("#name-"+data.keys[p][i]+"").popover("show");
                activeNetworkNode = data.keys[p][i];
            });
            
        //右边栏数据格式设置
        mainbar.append("text").attr("class","barvalue")
            .attr("x", c2[p]+60).attr("y",function(d){ return d.middle+5;})
            .text(function(d,i){ return d.value.toExponential(1) ;})
            .attr("text-anchor","end").style("fill","#428bca");
            
        mainbar.append("text").attr("class","barpercent")
            .attr("x", c3[p]-110).attr("y",function(d){ return d.middle+5;})
            .text(function(d,i){ return Math.round(100*d.percent)+"%" ;})
            .attr("text-anchor","end").style("fill","grey");
            
        d3.select("#"+id).select(".part"+p).select(".subbars")
            .selectAll(".subbar").data(data.subBars[p]).enter()
            .append("rect").attr("class","subbar")
            .attr("x", 0).attr("y",function(d){ return d.y})
            .attr("width",b).attr("height",function(d){ return d.h})
            .style("fill",function(d){ return colors[d.key1];});
    }
    
    function drawEdges(data, id){
        d3.select("#"+id).append("g").attr("class","edges").attr("transform","translate("+ b+",0)");

        d3.select("#"+id).select(".edges").selectAll(".edge")
            .data(data.edges).enter().append("polygon").attr("class","edge")
            .attr("points", edgePolygon).style("fill",function(d){ return colors[d.key1];})
            .style("opacity",0.5).each(function(d) { this._current = d; }); 
    }   
    
    function drawHeader(header, id){

        //中心标题的设置
        d3.select("#"+id).append("g").attr("class","header").append("text").text(header[2])
            .style("font-size","20").attr("x",150).attr("y",-20).style("text-anchor","middle")
            .style("font-weight","bold").style("fill","#428bca");
        
        [0,1].forEach(function(d){
            var h = d3.select("#"+id).select(".part"+d).append("g").attr("class","header");
            
            //标题栏位置和颜色设置
            h.append("text").text(header[d]).attr("x", (c1[d]))
                .attr("y", -5).style("fill","#428bca");
            
            h.append("text").text("计算值").attr("x", (c2[d]+15))
                .attr("y", -5).style("fill","#428bca");
            
            //标题栏下划线
            // h.append("line").attr("x1",c1[d]).attr("y1", -2)
            //     .attr("x2",c3[d]-100).attr("y2", -2).style("stroke","#428bca")
            //     .style("stroke-width","1").style("shape-rendering","crispEdges");
        });
    }
    
    function edgePolygon(d){
        return [0, d.y1, bb, d.y2, bb, d.y2+d.h2, 0, d.y1+d.h1].join(" ");
    }   
    
    //选择时的变换
    function transitionPart(data, id, p){
        var mainbar = d3.select("#"+id).select(".part"+p).select(".mainbars")
            .selectAll(".mainbar").data(data.mainBars[p]);
        
        mainbar.select(".mainrect").transition().duration(500)
            .attr("y",function(d){ return d.middle-d.height/2;})
            .attr("height",function(d){ return d.height;});
            
        mainbar.select(".barlabel").transition().duration(500)
            .attr("y",function(d){ return d.middle+5;});
            
        mainbar.select(".barvalue").transition().duration(500)
            .attr("y",function(d){ return d.middle+5;}).text(function(d,i){ return d.value.toExponential(1) ;});
            
        mainbar.select(".barpercent").transition().duration(500)
            .attr("y",function(d){ return d.middle+5;})
            .text(function(d,i){ return Math.round(100*d.percent)+"%" ;});
            
        d3.select("#"+id).select(".part"+p).select(".subbars")
            .selectAll(".subbar").data(data.subBars[p])
            .transition().duration(500)
            .attr("y",function(d){ return d.y}).attr("height",function(d){ return d.h});
    }
    
    function transitionEdges(data, id){
        d3.select("#"+id).append("g").attr("class","edges")
            .attr("transform","translate("+ b+",0)");

        d3.select("#"+id).select(".edges").selectAll(".edge").data(data.edges)
            .transition().duration(500)
            .attrTween("points", arcTween)
            .style("opacity",function(d){ return (d.h1 ==0 || d.h2 == 0 ? 0 : 0.5);});  
    }
    
    function transition(data, id){
        transitionPart(data, id, 0);
        transitionPart(data, id, 1);
        transitionEdges(data, id);
    }
    
    bP.draw = function(data, svg){
        data.forEach(function(biP,s){
            svg.append("g")
                .attr("id", biP.id)
                .attr("transform","translate("+ (550*s)+",0)");
                
            var visData = visualize(biP.data);
            drawPart(visData, biP.id, 0);
            drawPart(visData, biP.id, 1); 
            drawEdges(visData, biP.id);
            drawHeader(biP.header, biP.id);
            
            //左边栏p=0， 右边栏p=1
            [0,1].forEach(function(p){  
                d3.select("#"+biP.id)
                    .select(".part"+p)
                    .select(".mainbars")
                    .selectAll(".mainbar")
                    .on("mouseover",function(d, i){ 
                        bP.deSelectSegment(currentParallelData, 1, activeParallelNode);
                        return bP.selectSegment(data, p, i); 
                    })
                    .on("mouseout",function(d, i){ return bP.deSelectSegment(data, p, i); });   
            });
        }); 
    }
    
    bP.selectSegment = function(data, m, s){
        data.forEach(function(k){
            var newdata =  {keys:[], data:[]};  
                
            newdata.keys = k.data.keys.map( function(d){ return d;});            
            newdata.data[m] = k.data.data[m].map( function(d){ return d;});
            newdata.data[1-m] = k.data.data[1-m]
                .map( function(v){ return v.map(function(d, i){ return (s==i ? d : 0);}); });
            
            transition(visualize(newdata), k.id);
                
            var selectedBar = d3.select("#"+k.id).select(".part"+m).select(".mainbars")
                .selectAll(".mainbar").filter(function(d,i){ return (i==s);});
            
            selectedBar.select(".mainrect").style("stroke-opacity",1);          
            selectedBar.select(".barlabel").style('font-weight','bold');
            selectedBar.select(".barvalue").style('font-weight','bold');
            selectedBar.select(".barpercent").style('font-weight','bold');
        });
    }   
    
    bP.deSelectSegment = function(data, m, s){
        data.forEach(function(k){
            transition(visualize(k.data), k.id);
            
            var selectedBar = d3.select("#"+k.id).select(".part"+m).select(".mainbars")
                .selectAll(".mainbar").filter(function(d,i){ return (i==s);});
            
            selectedBar.select(".mainrect").style("stroke-opacity",0);          
            selectedBar.select(".barlabel").style('font-weight','normal');
            selectedBar.select(".barvalue").style('font-weight','normal');
            selectedBar.select(".barpercent").style('font-weight','normal');
        });     
    }
    
    this.bP = bP;
}();

versions = [ '15', '20', '21', '22', '23', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36']


$(document).ready(function(){


    $('#developer-comment-evolution').on('click',function(){

        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[0] + ".json","developer-evolution",300,868,868)},0);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[1] + ".json","developer-evolution",300,868,868)},2000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[2] + ".json","developer-evolution",300,868,868)},2000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[3] + ".json","developer-evolution",300,868,868)},2000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[4] + ".json","developer-evolution",300,868,868)},2000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[5] + ".json","developer-evolution",300,868,868)},2000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[6] + ".json","developer-evolution",300,868,868)},2000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[7] + ".json","developer-evolution",300,868,868)},2000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[8] + ".json","developer-evolution",300,868,868)},2000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[9] + ".json","developer-evolution",300,868,868)},2000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[10] + ".json","developer-evolution",300,868,868)},2000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[11] + ".json","developer-evolution",300,868,868)},2000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[12] + ".json","developer-evolution",300,868,868)},2000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[13] + ".json","developer-evolution",300,868,868)},2000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[14] + ".json","developer-evolution",300,868,868)},2000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[15] + ".json","developer-evolution",300,868,868)},2000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[16] + ".json","developer-evolution",300,868,868)},2000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[17] + ".json","developer-evolution",300,868,868)},2000);

    });


    // renderCircleGraph("/wordpress/circle_file_logic_15.json","file-logic",10);
    // renderCircleGraph("/wordpress/circle_file_syntax_15.json","file-syntax",10);
    // renderCircleGraph("/wordpress/circle_file_work_15.json","file-work",10);


    $.getJSON('/centrality/wordpress/15/developer', function(ANS) {
        mixedParallelData(ANS);
        renderMainGraph("/wordpress/circle_developer_comment_15.json","graph",300);
        renderCircleGraph("/wordpress/circle_developer_comment_15.json","developer-comment",100);
        renderCircleGraph("/wordpress/circle_developer_commit_15.json","developer-commit",100);
        renderCircleGraph("/wordpress/circle_developer_work_15.json","developer-work",100);
    });


    // $.getJSON('/analysis/wordpress/15/TT/degree', function(ANS) {
    //     renderTabel(ANS);
    // });

    //表格数据图
    // $('#version-selector').on('change',function(){
    //     $.getJSON('/analysis/wordpress/'+this.options[this.selectedIndex].value+'/developer/degree', function(ANS) {
    //         var table_html = '';
    //         table_html += table_base;
    //         for( var i=0;i < ANS.DegreeCentrality.length; i++){
    //             table_html += '<tr><td><a id="name-'+ANS.DegreeCentrality[i].name+
    //             '"class="btn-choice developer" href="#graph">'+ ANS.DegreeCentrality[i].name +
    //             '</a></td><td>'+ ANS.DegreeCentrality[i].logic +'</td><td>'+ 
    //             ANS.DegreeCentrality[i].syntax +'</td><td>'+ 
    //             ANS.DegreeCentrality[i].work +'</td><td>'+'</td></tr>';
    //         }

    //         $('#TT-analysis').html(table_html);

    //     });

    // });

    //平行数据表格和版本迭代关系的融合图
    $('label.version').on('click',function(event) {
        var mixedData = mixedGraphData( ($(this).html().split("<")[0]), 'version', $(this).hasClass('active'));
        if($('label.developer.active').html()){
            if(mixedData.activeVersion.length == 1){
                renderMainGraph("/wordpress/circle_"+($('label.developer.active').html().split("<")[0])+"_"+$(this).html().split("<")[0]+".json","graph",300);
            }else{
                $.ajax({
                    url: '/wordpress/mixeddata',
                    type: 'POST',
                    dataType: 'json',
                    data: { mixedData : mixedData }
                })
                .done(function( jsonData) {
                    console.log("mixed success");
                    renderMixedGraph(jsonData, "graph",300);
                })
                .fail(function() {
                    console.log("mixed error");
                })
                .always(function() {
                    console.log("mixed complete");
                });
            }
        }

        $.getJSON("/centrality/wordpress/"+($(this).html().split("<")[0])+"/developer", function(ANS) {
            mixedParallelData(ANS);
        });

        // if( mixedData.activeVersion.length ){
        //     document.location.href = "#parallel";
        //     $.ajax({
        //         url: '/analysis/mixed/wordpress/developer/degree',
        //         type: 'POST',
        //         dataType: 'json',
        //         data: {mixedData: mixedData},
        //     })
        //     .done(function(ANS) {
        //         parallelData(ANS);
        //         console.log("success");
        //     })
        //     .fail(function() {
        //         console.log("error");
        //     })
        //     .always(function() {
        //         console.log("complete");
        //     });           
        // }

    });


    $('label.developer').on('click',function(event) {
        var mixedData = mixedGraphData( ($(this).html().split("<")[0]), 'developer', $(this).hasClass('active'));
        if($('label.version.active').html()){
            if(mixedData.activeVersion.length == 1){
                renderMainGraph("/wordpress/circle_"+($(this).html().split("<")[0])+"_"+$('label.version.active').html().split("<")[0]+".json","graph",300);
            }else{
                $.ajax({
                    url: '/wordpress/mixeddata',
                    type: 'POST',
                    dataType: 'json',
                    data: { mixedData : mixedData }
                })
                .done(function( jsonData) {
                    console.log("mixed success");
                    renderMixedGraph(jsonData, "graph",300);
                })
                .fail(function() {
                    console.log("mixed error");
                })
                .always(function() {
                    console.log("mixed complete");
                });
                
            }
        }
    });

    //$('#graph-tab a:last').tab('show');
    //$('#evolution-tab a:last').tab('show');

});


//复合版本所需要的关系网络数据整合
function mixedGraphData( clickedButton, type, isActive){

    var mixedData ;

    var activeVersion = [];
    $('label.version.active').each(function() {
        if( $(this).html().split("<")[0] != clickedButton ){
            activeVersion.push($(this).html().split("<")[0]);
        }
    });
    var activeDeveloper = [];
    $('label.developer.active').each(function() {
        if( $(this).html().split("<")[0] != clickedButton ){
            activeDeveloper.push($(this).html().split("<")[0]);
        }
    });

    console.log(type+isActive);

    if( type == 'developer' && !isActive ){
        activeDeveloper.push(clickedButton);
    }
    if( type == 'version' && !isActive ){
        activeVersion.push(clickedButton);
    }

    console.log(activeVersion);
    //console.log(activeTT);
    console.log(activeDeveloper);
    var mixedData = { 
        'activeVersion' : activeVersion,
        'activeDeveloper' : activeDeveloper
    };
    return mixedData;


}

//复合版本所需要的平行图表网络数据整合
function mixedParallelData(ANS){

    $("#parallel").html("");
    var parallel = [];
    var singleArray;

    currentNetworkData = ANS;

    for( var i=0;i < ANS.CommentCentrality.length; i++){
        singleArray = new Array(3);
        singleArray[0] = "bc";
        singleArray[1] = ANS.CommentCentrality[i].name;
        singleArray[2] = ANS.CommentCentrality[i].betweenness;
        singleArray[3] = ANS.CommitCentrality[i].betweenness;
        singleArray[4] = ANS.WorkCentrality[i].betweennesss;
        parallel.push(singleArray);
        singleArray = new Array(3);
        singleArray[0] = "clc";
        singleArray[1] = ANS.CommentCentrality[i].name;
        singleArray[2] = ANS.CommentCentrality[i].closeness;
        singleArray[3] = ANS.CommitCentrality[i].closeness;
        singleArray[4] = ANS.WorkCentrality[i].closeness;
        parallel.push(singleArray);
        // singleArray = new Array(3);
        // singleArray[0] = "communicability";
        // singleArray[1] = ANS.DegreeCentrality[i].name;
        // singleArray[2] = ANS.DegreeCentrality[i].communicability;
        // parallel.push(singleArray);
        singleArray = new Array(3);
        singleArray[0] = "dc";
        singleArray[1] = ANS.CommentCentrality[i].name;
        singleArray[2] = ANS.CommentCentrality[i].degree;
        singleArray[3] = ANS.CommitCentrality[i].degree;
        singleArray[4] = ANS.WorkCentrality[i].degree;
        parallel.push(singleArray);
        singleArray = new Array(3);
        singleArray[0] = "lc";
        singleArray[1] = ANS.CommentCentrality[i].name;
        singleArray[2] = ANS.CommentCentrality[i].load;
        singleArray[3] = ANS.CommitCentrality[i].load;
        singleArray[4] = ANS.WorkCentrality[i].load;
        parallel.push(singleArray);
        singleArray = new Array(3);
        singleArray[0] = "cfbc";
        singleArray[1] = ANS.CommentCentrality[i].name;
        singleArray[2] = ANS.CommentCentrality[i].current_flow_betweenness;
        singleArray[3] = ANS.CommitCentrality[i].current_flow_betweenness;
        singleArray[4] = ANS.WorkCentrality[i].current_flow_betweenness;
        parallel.push(singleArray);
        singleArray = new Array(3);
        singleArray[0] = "cfcc";
        singleArray[1] = ANS.CommentCentrality[i].name;
        singleArray[2] = ANS.CommentCentrality[i].current_flow_closeness;
        singleArray[3] = ANS.CommitCentrality[i].current_flow_closeness;
        singleArray[4] = ANS.WorkCentrality[i].current_flow_closeness;
        parallel.push(singleArray);
    }

    var width = 1200, height = 610, margin ={b:50, t:50, l:120, r:0};

    var svg = d3.select("#parallel")
        .append("svg").attr('width',width).attr('height',(height+margin.b+margin.t))
        .append("g").attr("transform","translate("+ margin.l+","+margin.t+")");

    var data = [ 
        {data:bP.partData(parallel,2), id:'CommentCentrality', header:["度量值","开发者", "交流关系网络"]},
        {data:bP.partData(parallel,3), id:'CommitCentrality', header:["度量值","开发者", "协作关系网络"]}
        //{data:bP.partData(parallel,4), id:'WorkCentrality', header:["度量值","开发者", "工作依赖网络"]}
    ];

    currentParallelData = data;
    bP.draw(data, svg);
    
}


//渲染分离版本的表格数据
function renderTabel(ANS){
        var table_html = '';
        table_html += table_base;
        for( var i=0;i < ANS.DegreeCentrality.length; i++){
            table_html += '<tr><td><a id="name-'+ANS.DegreeCentrality[i].name+
            '"class="btn-choice developer" href="#graph">'+ ANS.DegreeCentrality[i].name +
            '</a></td><td>'+ ANS.DegreeCentrality[i].logic +'</td><td>'+ 
            ANS.DegreeCentrality[i].syntax +'</td><td>'+ 
            ANS.DegreeCentrality[i].work +'</td><td>'+'</td></tr>';
        }

        $('#TT-analysis').html(table_html);
    }


document.getElementById('version-selector').addEventListener('change', selectVersion);  

var developer_list = null;
d3.json("/wordpress/developer.json",function(error,data){
    developer_list = data;
});

var file_list = null;
d3.json("/wordpress/file.json",function(error,data){
    file_list = data;
});

function selectVersion(){

    renderCircleGraph("/wordpress/circle_developer_comment_" + this.options[this.selectedIndex].value + ".json","developer-comment",100);
    renderCircleGraph("/wordpress/circle_developer_commit_" + this.options[this.selectedIndex].value + ".json","developer-commit",100);
    renderCircleGraph("/wordpress/circle_developer_work_" + this.options[this.selectedIndex].value + ".json","developer-work",100); 

};


//对演化版本直接使用json文件进行渲染
var renderMainGraph = function( jsonFile, divId, distance){

    var width = 868,
        height = 868;

    var color = d3.scale.category20();

    var force = d3.layout.force()
        .charge(-500)
        .linkDistance(distance)
        .size([width, height]);

    //将矢量图的div区块清空
    d3.select(document.getElementById(divId)).html("");

    var svg = d3.select(document.getElementById(divId)).append("svg")
        .attr("width", width)
        .attr("height", height);


    d3.json(jsonFile, function(error, graph) {
        force
            .nodes(graph.nodes)
            .links(graph.links)
            .start();

        var link = svg.selectAll(".link")
            .data(graph.links)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke-width", function(d) { return Math.sqrt(d.value); });

        var node = svg.selectAll(".node")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", 8)
            .style("fill", function(d) { return color(d.group); })
            .call(force.drag);

        var text = svg.selectAll(".text")
            .data(graph.nodes)
            .enter().append("text")
            .style("fill", function(d) { return color(d.group); })
            .text(function(d) { return d.name ; })
            .attr("id", function(d){return "name-"+d.name;})
            .attr("data-container","body")
            .attr("data-toggle","popover")
            .attr("data-placement","top")
            .attr("data-html",true)
            .attr("data-content",function(d){ 
                return "<div '>"+
                "<h3 style='color:"+color(d.group)+"'>开发者: "+d.name+
                "</h3><table class='table table-responsive' style='text-align:left'>"+
                "<tr><th>Centrality</th><th>dc</th><th>bc</th><th>cc</th><th>lc</th><th>cfbc</th><th>cfcc</th></tr>"+
                "<tr class='info'><td>Comment</td>"+
                "<td>"+currentNetworkData.CommentCentrality[d.group].degree.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommentCentrality[d.group].betweenness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommentCentrality[d.group].closeness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommentCentrality[d.group].load.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommentCentrality[d.group].current_flow_betweenness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommentCentrality[d.group].current_flow_closeness.toExponential(1)+"</td>"+
                "</tr>"+
                "<tr class='success'><td>Commit</td>"+
                "<td>"+currentNetworkData.CommitCentrality[d.group].degree.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommitCentrality[d.group].betweenness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommitCentrality[d.group].closeness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommitCentrality[d.group].load.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommitCentrality[d.group].current_flow_betweenness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommitCentrality[d.group].current_flow_closeness.toExponential(1)+"</td>"+
                "</tr>"+
                "<tr class='warning'><td>Work</td>"+
                "<td>"+currentNetworkData.WorkCentrality[d.group].degree.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.WorkCentrality[d.group].betweenness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.WorkCentrality[d.group].closeness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.WorkCentrality[d.group].load.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.WorkCentrality[d.group].current_flow_betweenness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.WorkCentrality[d.group].current_flow_closeness.toExponential(1)+"</td>"+
                "</tr>"+
                "</table></div>"
            })
            .on("mouseover", function(d){ 
                $("#name-"+ activeNetworkNode +"").popover("hide");
                $(this).popover('show');
            })
            .on("mouseout", function(d){ 
                $(this).popover('hide');
            })     
            //关系网络向平行表格的跳转   
            .on("click", function(d){
                //document.location.href = "#parallel";
                $('#evolution-tab a:last').tab('show');
                activeParallelNode = currentParallelData[0].data.keys[1].indexOf(d.name);
                bP.selectSegment(currentParallelData, 1, activeParallelNode);
            })
            .call(force.drag);


        force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            text.attr("x", function(d) { return (d.x+10); })
                .attr("y", function(d) { return (d.y+10); });
            
        });
    });


}


//对演化版本直接使用json数据进行渲染，而不是json文件
var renderMixedGraph = function( jsonData, divId, distance){

    var width = 868,
        height = 868;

    var color = d3.scale.category20();

    var force = d3.layout.force()
        .charge(-500)
        .linkDistance(distance)
        .size([width, height]);

    /*clear the graph out*/
    d3.select(document.getElementById(divId)).html("");

    var svg = d3.select(document.getElementById(divId)).append("svg")
        .attr("width", width)
        .attr("height", height);

    force
        .nodes(jsonData.nodes)
        .links(jsonData.links)
        .start();

    var link = svg.selectAll(".link")
        .data(jsonData.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return Math.sqrt(d.value); });

    var node = svg.selectAll(".node")
        .data(jsonData.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 8)
        .style("fill", function(d) { return color(d.group); })
        .call(force.drag);

    var text = svg.selectAll(".text")
        .data(jsonData.nodes)
        .enter().append("text")
        .style("fill", function(d) { return color(d.group); })
        .text(function(d) { return d.name ; })
        .attr("id", function(d){return "name-"+d.name;})
        .attr("data-container","body")
        .attr("data-toggle","popover")
        .attr("data-placement","top")
        .attr("data-html",true)
        .attr("data-content",function(d){ 
                return "<div '>"+
                "<h3 style='color:"+color(d.group)+"'>开发者: "+d.name+
                "</h3><table class='table table-responsive' style='text-align:left'>"+
                "<tr><th>Centrality</th><th>dc</th><th>bc</th><th>cc</th><th>lc</th><th>cfbc</th><th>cfcc</th></tr>"+
                "<tr class='info'><td>Comment</td>"+
                "<td>"+currentNetworkData.CommentCentrality[d.group].degree.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommentCentrality[d.group].betweenness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommentCentrality[d.group].closeness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommentCentrality[d.group].load.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommentCentrality[d.group].current_flow_betweenness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommentCentrality[d.group].current_flow_closeness.toExponential(1)+"</td>"+
                "</tr>"+
                "<tr class='success'><td>Commit</td>"+
                "<td>"+currentNetworkData.CommitCentrality[d.group].degree.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommitCentrality[d.group].betweenness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommitCentrality[d.group].closeness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommitCentrality[d.group].load.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommitCentrality[d.group].current_flow_betweenness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommitCentrality[d.group].current_flow_closeness.toExponential(1)+"</td>"+
                "</tr>"+
                "<tr class='warning'><td>Work</td>"+
                "<td>"+currentNetworkData.WorkCentrality[d.group].degree.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.WorkCentrality[d.group].betweenness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.WorkCentrality[d.group].closeness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.WorkCentrality[d.group].load.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.WorkCentrality[d.group].current_flow_betweenness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.WorkCentrality[d.group].current_flow_closeness.toExponential(1)+"</td>"+
                "</tr>"+
                "</table></div>"
            })
        .on("mouseover", function(d){ 
            console.log(d.name+" over"); 
            $("#name-"+ activeNetworkNode +"").popover("hide");
            $(this).popover('show');
        })
        .on("mouseout", function(d){ 
            console.log(d.name+" out"); 
            $(this).popover('hide');
        })
        .on("click", function(d){
            console.log(d.name+' click');
            //document.location.href = "#parallel";
            $('#evolution-tab a:last').tab('show');
            activeParallelNode = currentParallelData[0].data.keys[1].indexOf(d.name);
            bP.selectSegment(currentParallelData, 1, activeParallelNode);
        })
        .call(force.drag);


        force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            text.attr("x", function(d) { return (d.x+10); })
                .attr("y", function(d) { return (d.y+10); });
            
        });
    
}

//分离数据网络使用的基本Circle关系网络渲染
var renderCircleGraph = function( jsonFile, divId, distance, width, height){

    var width = width?width:350,
        height = height?height:350;

    var color = d3.scale.category20();

    var force = d3.layout.force()
        .charge(-120)
        .linkDistance(distance)
        .size([width, height]);

    /*clear the graph out*/
    d3.select(document.getElementById(divId)).html("");

    var svg = d3.select(document.getElementById(divId)).append("svg")
        .attr("width", width)
        .attr("height", height);


    d3.json(jsonFile, function(error, graph) {
        force
            .nodes(graph.nodes)
            .links(graph.links)
            .start();

        var link = svg.selectAll(".link")
            .data(graph.links)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke-width", function(d) { return Math.sqrt(d.value); });

        var node = svg.selectAll(".node")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", 5)
            .style("fill", function(d) { return color(d.group); })
            .call(force.drag);

        var text = svg.selectAll(".text")
            .data(graph.nodes)
            .enter().append("text")
            .style("fill", function(d) { return color(d.group); })
            .text(function(d) { return d.name ; })
            .attr("id", function(d){return "name-"+d.name;})
            .attr("data-container","body")
            .attr("data-toggle","popover")
            .attr("data-placement","top")
            .attr("data-html",true)
            .attr("data-content",function(d){ 
                return "<div '>"+
                "<h3 style='color:"+color(d.group)+"'>开发者: "+d.name+
                "</h3><table class='table table-responsive' style='text-align:left'>"+
                "<tr><th>Centrality</th><th>dc</th><th>bc</th><th>cc</th><th>lc</th><th>cfbc</th><th>cfcc</th></tr>"+
                "<tr class='info'><td>Comment</td>"+
                "<td>"+currentNetworkData.CommentCentrality[d.group].degree.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommentCentrality[d.group].betweenness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommentCentrality[d.group].closeness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommentCentrality[d.group].load.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommentCentrality[d.group].current_flow_betweenness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommentCentrality[d.group].current_flow_closeness.toExponential(1)+"</td>"+
                "</tr>"+
                "<tr class='success'><td>Commit</td>"+
                "<td>"+currentNetworkData.CommitCentrality[d.group].degree.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommitCentrality[d.group].betweenness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommitCentrality[d.group].closeness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommitCentrality[d.group].load.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommitCentrality[d.group].current_flow_betweenness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.CommitCentrality[d.group].current_flow_closeness.toExponential(1)+"</td>"+
                "</tr>"+
                "<tr class='warning'><td>Work</td>"+
                "<td>"+currentNetworkData.WorkCentrality[d.group].degree.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.WorkCentrality[d.group].betweenness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.WorkCentrality[d.group].closeness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.WorkCentrality[d.group].load.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.WorkCentrality[d.group].current_flow_betweenness.toExponential(1)+"</td>"+
                "<td>"+currentNetworkData.WorkCentrality[d.group].current_flow_closeness.toExponential(1)+"</td>"+
                "</tr>"+
                "</table></div>"
            })
            .on("mouseover", function(d){ 
                console.log(d.name+" over"); 
                $("#name-"+ activeNetworkNode +"").popover("hide");
                $(this).popover('show');
            })
            .on("mouseout", function(d){ 
                console.log(d.name+" out"); 
                $(this).popover('hide');
            })
            .call(force.drag);


        force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            text.attr("x", function(d) { return d.x; })
                .attr("y", function(d) { return d.y; });
            
        });
    });


}

//已弃用，渲染平行表格的数据
function parallelData(ANS){
    $("#parallel").html("");
    var parallel = [];
    var singleArray;
    currentNetworkData = ANS;
    for( var i=0;i < ANS.DegreeCentrality.length; i++){
        singleArray = new Array(3);
        singleArray[0] = "logic";
        singleArray[1] = ANS.DegreeCentrality[i].name;
        singleArray[2] = ANS.DegreeCentrality[i].logic;
        //singleArray[3] = ANS.BetweenessCentrality[i].logic;
        parallel.push(singleArray);
        singleArray = new Array(3);
        singleArray[0] = "syntax";
        singleArray[1] = ANS.DegreeCentrality[i].name;
        singleArray[2] = ANS.DegreeCentrality[i].syntax;
        //singleArray[3] = ANS.BetweenessCentrality[i].logic;
        parallel.push(singleArray);
        singleArray = new Array(3);
        singleArray[0] = "work";
        singleArray[1] = ANS.DegreeCentrality[i].name;
        singleArray[2] = ANS.DegreeCentrality[i].work;
        //singleArray[3] = ANS.BetweenessCentrality[i].logic;
        parallel.push(singleArray);
    }
    var width = 1200, height = 610, margin ={b:50, t:50, l:300, r:0};

    var svg = d3.select("#parallel")
        .append("svg").attr('width',width).attr('height',(height+margin.b+margin.t))
        .append("g").attr("transform","translate("+ margin.l+","+margin.t+")");

    var data = [ 
        {data:bP.partData(parallel,2), id:'DegreeCentrality', header:["Category","State", "Centrality Analysis"]},
        //{data:bP.partData(parallel,3), id:'BetweenessCentrality', header:["Category","State", "Centrality Analysis"]}
    ];

    currentParallelData = data;
    bP.draw(data, svg);
}

//不使用，测试使用的带标签渲染，后直接在renderCircle中添加text节点。
var renderLabelGraph = function(jsonFile, divId){
    var w = 500, h = 500;

    var labelDistance = 0;

    var vis = d3.select(document.getElementById(divId)).append("svg:svg").attr("width", w).attr("height", h);

    d3.json(jsonFile, function(error, graph) {

        var force = d3.layout.force().size([w, h]).nodes(graph.nodes).links(graph.links).gravity(1).linkDistance(50).charge(-3000).linkStrength(function(x) {
            return x.weight * 10
        });


        force.start();

        var force2 = d3.layout.force().nodes(graph.labelAnchors).links(graph.labelAnchorLinks).gravity(0).linkDistance(0).linkStrength(8).charge(-100).size([w, h]);
        force2.start();

        var link = vis.selectAll("line.link").data(graph.links).enter().append("svg:line").attr("class", "link").style("stroke", "#CCC");

        var node = vis.selectAll("g.node").data(force.nodes()).enter().append("svg:g").attr("class", "node");
        node.append("svg:circle").attr("r", 5).style("fill", "#555").style("stroke", "#FFF").style("stroke-width", 3);
        node.call(force.drag);


        var anchorLink = vis.selectAll("line.anchorLink").data(graph.labelAnchorLinks)//.enter().append("svg:line").attr("class", "anchorLink").style("stroke", "#999");

        var anchorNode = vis.selectAll("g.anchorNode").data(force2.nodes()).enter().append("svg:g").attr("class", "anchorNode");
        anchorNode.append("svg:circle").attr("r", 0).style("fill", "#FFF");
            anchorNode.append("svg:text").text(function(d, i) {
            return i % 2 == 0 ? "" : d.node.label
        }).style("fill", "#555").style("font-family", "Arial").style("font-size", 12);

        var updateLink = function() {
            this.attr("x1", function(d) {
                return d.source.x;
            }).attr("y1", function(d) {
                return d.source.y;
            }).attr("x2", function(d) {
                return d.target.x;
            }).attr("y2", function(d) {
                return d.target.y;
            });

        }

        var updateNode = function() {
            this.attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        }

        force.on("tick", function() {

            force2.start();

            node.call(updateNode);

            anchorNode.each(function(d, i) {
                if(i % 2 == 0) {
                    d.x = d.node.x;
                    d.y = d.node.y;
                } else {
                    var b = this.childNodes[1].getBBox();

                    var diffX = d.x - d.node.x;
                    var diffY = d.y - d.node.y;

                    var dist = Math.sqrt(diffX * diffX + diffY * diffY);

                    var shiftX = b.width * (diffX - dist) / (dist * 2);
                    shiftX = Math.max(-b.width, Math.min(0, shiftX));
                    var shiftY = 5;
                    this.childNodes[1].setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
                }
            });


            anchorNode.call(updateNode);

            link.call(updateLink);
            anchorLink.call(updateLink);

        });

    });


}








