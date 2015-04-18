(function($){
    var width = 1000, height = 700;
    var link_len = 200;
    var color = d3.scale.category20();
    var force = d3.layout.force();
    var g_nodes = force.nodes();
    var g_links = force.links();
    var svg = undefined;
    var zoom = undefined;
    var cid = "0";
    var scale = 1;
    var graph_hash = {
        "company": "com?id",
        "companyaddr" : "com?comaddr",
        "companyboard" : "com?comboss",
        "company-by-boss" : "com?target",
        "board" : "boss?bossid"
    };
    var graph_info = {
        "company": "有個人或法人投資關係的公司。<br>連線寬度: 共同董事席次數<br>連線顏色: 紅-個人, 藍-法人<br>Node大小: 董監事數量",
        "companyaddr": "地址相同的公司。",
        "companyboard": "有直接投資關係的公司。<br>Node顏色: 有無和查詢的公司有共同董事(同顏色表示有)<br>連線寬度: 共同董事席次<br>連線顏色: 紅-個人, 藍-法人",
        "company-by-boss": "該董事名下的公司關係圖。<br>連線寬度: 共同董事席次數<br>連線顏色: 紅-個人, 藍-法人<br>Node大小: 董監事數量",
        "board": "董事關係圖, 連線表示兩名董事有共同公司。Node大小: 該董事頭銜數。"
    };
    
    var switchGraph = function(){
        //switch tab
        var p = $(this).parent();
        p.parent().children('li').removeClass("active");
        p.addClass("active");
        
        var graphtype = $(this).attr("id");
        console.log("switchGraph: caller = " + graphtype);
        $('#graphopt').attr("value", graphtype);

        //update explaination
        $('#graphinfo').empty().append("<p>" + graph_info[graphtype] + "</p>")

        restapi = "http://dataing.pw/" + graph_hash[graphtype] + "=" + cid + "&maxlvl=1";
        console.log("switchGraph: restapi = " + restapi);
        $.getJSON("/getjson?api="+ encodeURIComponent(restapi) , json_update_callback); //end get JSON 
        //return window.location = 'http://twcom-analysis.herokuapp.com/' + graphtype + '/id/' + $('#bosslist').text();
        //return window.location = '/' + graphtype + '/id/' + $('#cid').text();
    };

    var update_links = function(){
                 svg.selectAll('.link').attr("x1", function(d) {
		  	        var deltaX = d.target.x - d.source.x,
		  		        deltaY = d.target.y - d.source.y,
		  		        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
		  		        normX = deltaX / dist,
		  		        //targetPadding = Math.sqrt(d.target.size) * circle_size ;
		  		        targetPadding = d.target.size ;
			        return d.target.x - (targetPadding * normX) * scale;
		        })
                .attr("y1", function(d) { 
                    var deltaX = d.target.x - d.source.x,
                        deltaY = d.target.y - d.source.y,
                        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                        normY = deltaY / dist,
                        //targetPadding = Math.sqrt(d.target.size) * circle_size ;
                        targetPadding = d.target.size;
                    return d.target.y - (targetPadding * normY) * scale;
                })
                .attr("x2", function(d) { 
                    var deltaX = d.target.x - d.source.x,
                        deltaY = d.target.y - d.source.y,
                        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                        normX = deltaX / dist,
                        //sourcePadding = Math.sqrt(d.source.size) * circle_size +10;
                        sourcePadding = d.source.size +10;
                    return d.source.x + (sourcePadding * normX)* scale; 
                })
                .attr("y2", function(d) { 
                    var deltaX = d.target.x - d.source.x,
                        deltaY = d.target.y - d.source.y,
                        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                        normY = deltaY / dist,
                        //sourcePadding = Math.sqrt(d.source.size) * circle_size +10;
                        sourcePadding = d.source.size+10;
                    return d.source.y + (sourcePadding * normY)* scale;
                });
    };
/*    
    var zoom_out= function(){
            var scale = zoom.scale();
            if(scale>1){
                scale -= 0.2;
                svg.selectAll("circle").attr("r", function(d) {
                    return d.size * scale;
                });
                force.linkDistance(link_len * scale).start();
                //svg.selectAll(".link").attr("d", linkArc);
                update_links();
            }
    };
    var zoom_in= function(){
            var scale = zoom.scale();
            if(scale<10){
                scale += 0.2;
                svg.selectAll("circle").attr("r", function(d) {
                    return d.size * scale;
                });
                force.linkDistance(link_len * scale).start();
                //svg.selectAll(".link").attr("d", linkArc);
                update_links();
            }
    };
    var linkArc = function(d) {
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy);
            normX = dx / dr;
            normY = dy / dr;

            xtpadding = normX * d.target.size;
            ytpadding = normY * d.target.size;
            xspadding = normX * d.source.size;
            yspadding = normY * d.source.size;

            sx = d.source.x + xspadding;
            sy = d.source.y + yspadding;
            tx = d.target.x - xtpadding - 10;
            ty = d.target.y - ytpadding - 10;

        return "M" + 
            sx + "," + 
            sy + "A" + 
            dr + "," + dr + " 0 0,1 " + 
            tx + "," + 
            ty;
    };
*/

    var on_zoom = function(){
        console.log("on_zoom, scale = " + d3.event.scale)
        svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); 
    };

	//set active tab
	if($(location).attr('href').match('companyaddr')){
		$('#companyaddr').addClass('active');
	}else if($(location).attr('href').match('companyboard')){
		$('#companyboard').addClass('active');
	}else{
		$('#company').addClass('active');
	}
	
    var update = function(){
        console.log("in update");
   
        //update notes
        var nodes = svg.selectAll(".node")
                    .data(g_nodes, key=function(n){ return n.name; });
    
		nodes.enter().append("circle")
                        .attr("class", "node")
                        .call(force.drag)
                        .attr("r", function(n){ return n.size })
                        .style("fill", function(n){ return color(n.group) })
                        //.on("mouseover", function(n){
                        //    var info = n.tooltip;
						//	br_info = info.replace(new RegExp('\n', 'g'), '<br>');
						//	$("#nodeinfo").empty().append(br_info);
                        //})
						.on("click", function(n){
							var info = n.tooltip;
							br_info = info.replace(new RegExp('\n', 'g'), '<br>');
							$("#nodeinfo").empty().append(br_info);
							$('#ModalNode').modal('show');
						});

        nodes.exit().remove();
        
        var texts = svg.selectAll("text.node")
                        .data(g_nodes);

        texts.enter().append("text")
                        .attr("class", "node")
                        .attr("text-anchor" ,"middle")
                        .attr("font-size", 12 + "px")
                        .style("color", "black")
                        .text(function(d) { return d.name });
        texts.exit().remove(); 

        //update links
        var links = svg.selectAll(".link")
                    .data(g_links);
                    
        links.enter().append("line")
                        .attr("class", "link")
                        .attr("marker-end", "url(#path-arrow)")
                        .style("stroke-width", function(d){ return d.width })
                        .style("fill", "none")
                        .style("stroke", function(d){
                            if(d.ivst==1){
                                return "rgba(255, 0, 0, 0.5)";
                            }else if(d.ivst==0){
                                return "rgba(0, 0, 255, 0.5)";
                            }
                        });
                        
        links.exit().remove();
 
        var update_partial = function() {
                update_links();
                //links.attr("d", linkArc);
                nodes.attr("cx", function(d) { return d.x; })
                        .attr("cy", function(d) { return d.y; });
                texts.attr("x", function(d) { return d.x  })
                        .attr("y", function(d) { return d.y  });
        };
        //update_partial();

        force.on("tick", update_partial); //end force.on("tick") 
    };

    var json_update_callback = function(data){
        
            // if error, show error msgs
            if(!data.nodes){
                console.log("error:" + data.error);
                $('#d3-container').empty().append("<div class=\"alert alert-danger\">" + data.error +"</div>");
                return;
            }
         
            g_nodes = data.nodes;
            g_links = data.links;
			//var bossarray = $('#bosslist').text().replace("[u'","").replace("']","").split("', u'");
			//var bosslink = '';
			//for(i=0;i<bossarray.length;i++){
				//bosslink += '<a href="/company/boss/';
				//bosslink += encodeURIComponent(bossarray[i]);
				//bosslink += '">'+ bossarray[i] + '</a><br>';
			//}
			//$('#bossinfo').append(bosslink);
            $('#basicinfo').empty()
            $('#basicinfo').append("<p>Number of nodes: " + g_nodes.length + "</p>" );
            $('#basicinfo').append("<p>Number of links: " + g_links.length + "</p>" );

            force.nodes(g_nodes).links(g_links)
                .charge(-600)
                .linkDistance(link_len)
                .size([width, height])
                .start();
        
            update(); 
            
        };
    $('document').ready(function(){
        height = window.innerHeight;
        
        //updata navbar
//        var navs = $('#graph-nav').children().removeClass('active');
//       var graphtype = $('#graphtype').text();
//        console.log("graph type: "+graphtype)
//        $("#"+graphtype).parent().addClass('active');
        
        zoom = d3.behavior.zoom();
        
        // initialize svg object
        svg = d3.select("#d3-container")
                .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                .append("g")
                    .call(zoom.scaleExtent([1, 10]).on("zoom", on_zoom));

        svg.append("defs").selectAll("marker")
               .data(["arrow"])
            .enter()
                .append("marker")
                    .attr("id", "path-arrow")
                    .attr("viewBox", "0 -5 10 10")
                    .attr("markerUnits", "userSpaceOnUse")
                    .attr("refX", 0)
                    .attr("refY", 0)
                    .attr("markerWidth", 8)
                    .attr("markerHeight", 15)
                    .attr("orient", "auto")
                .append("svg:path")
                    .attr("d", "M0,-5L10,0L0,5")
                    .attr("fill", "rgba(32,140,153,1)");
        // initialize other views
        /*
        $('#infopanel').css("height", height);
        $('#d3-container').bind("DOMMouseScroll mousewheel", function(e){
            e.preventDefault();

            if(e.originalEvent.wheelDelta < 0) {
                zoom_out();
            }else{
                zoom_in();
            }
        });
        $('#zoom-btn-group').find('button').on('click', function(e){
            e.preventDefault();
            if($(this).attr("id")=="zoom-out"){
                zoom_out();
            }else if($(this).attr("id")=="zoom-in"){
                zoom_in();
            }
        });
        */
        $('.graph-tab').on('click', switchGraph);
   

        // get target company number for query
        cid = $('#cid').text();
        graphtype = $('#graphtype').text()
        $('#graphinfo').empty().append("<p>" + graph_info[graphtype] + "</p>")
		$('#graphbutton').on('click', function(){
			$('#ModalInfo').modal('show');
		});
        
        //restapi = $('#restapi').text();
        
        // get json through API
        restapi = "http://dataing.pw/" + graph_hash[graphtype]+ "=" + cid;
        if(graphtype!="company-by-boss") restapi = restapi + "&maxlvl=1";

        console.log("getting "+ cid + "from "+ restapi + "......" + encodeURIComponent(restapi) + " 4");
        $.getJSON("/getjson?api="+ encodeURIComponent(restapi) , json_update_callback); //end get JSON 

    }); //end document ready
    
})(jQuery);
