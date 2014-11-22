(function($){
    var width = 960, height = 500;
    var color = d3.scale.category20();
    var force = d3.layout.force();
    var g_nodes = force.nodes();
    var g_links = force.links();
    var svg = undefined;
    var cid = "0";
    var circle_size = 3;

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

	var build_links = function(nodes, links){
		var d3_links = [];

        //in d3.js, nodes are indexed by it's array index, and links must use them to indicate a link
        
        //NOTE: This function might be a performance bottleneck ( O(n^2) ) yet to optimize
        var find_index_of_id = function(nds, id) {
            for (var i = 0; i < nds.length; i++) {
                if (nds[i].id == id) return i;                 
            }
            return -1;  
        }

		for(var i=0; i<links.length; i++){
            var tmp = {
                "source" : find_index_of_id(nodes, links[i].src.id),
                "target" : find_index_of_id(nodes, links[i].dst.id)
            };
			d3_links.push(tmp);
		}
		return d3_links;
	};

    var update = function(){
        console.log("in update");
        var links = svg.selectAll(".link")
                    .data(g_links);
                    
        links.enter().append("path")
                        .attr("class", "link")
                        .attr("marker-end", "url(#path-arrow)")
                        .style("stroke-width", function(d){ return d.width })
                        .style("fill", "none")
                        .style("stroke", "gray");

                        
        //links.exit().remove();
    
        var nodes = svg.selectAll(".node")
                    .data(g_nodes, key=function(n){ return n.name; });
    
        nodes.enter().append("circle")
                        .attr("class", "node")
                        .call(force.drag)
                        .attr("r", function(n){ return n.size })
                        .style("fill", function(n){ return color(n.group) })
                        .on("mouseover", function(n){
                            var info = n.tooltip.replace(/\n/g, "<br> ");
                            $("#nodeinfo").append(info);
                        })
                     .append("title")
                        .text(function(n){ return n.tooltip })
                        .attr("x", function(n){ return n.x })
                        .attr("y", function(n){ return n.y });

        var texts = svg.selectAll("text.node")
                        .data(g_nodes)
                    .enter().append("text")
                        .attr("class", "node")
                        .attr("text-anchor" ,"middle")
                        .attr("font-size", 12 + "px")
                        .style("color", "black")
                        .text(function(d) { return d.name });
    
        //nodes.exit().remove();
         force.on("tick", function() {
         /*
                links.attr("x1", function(d) {
		  	        var deltaX = d.target.x - d.source.x,
		  		        deltaY = d.target.y - d.source.y,
		  		        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
		  		        normX = deltaX / dist,
//		  		        targetPadding = Math.sqrt(d.target.size) * circle_size ;
		  		        targetPadding = d.target.size ;
			        return d.target.x - (targetPadding * normX);
		        })
                .attr("y1", function(d) { 
                    var deltaX = d.target.x - d.source.x,
                        deltaY = d.target.y - d.source.y,
                        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                        normY = deltaY / dist,
                        //targetPadding = Math.sqrt(d.target.size) * circle_size ;
                        targetPadding = d.target.size;
                    return d.target.y - (targetPadding * normY);
                })
                .attr("x2", function(d) { 
                    var deltaX = d.target.x - d.source.x,
                        deltaY = d.target.y - d.source.y,
                        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                        normX = deltaX / dist,
                        //sourcePadding = Math.sqrt(d.source.size) * circle_size +10;
                        sourcePadding = d.source.size +10;
                    return d.source.x + (sourcePadding * normX); 
                })
                .attr("y2", function(d) { 
                    var deltaX = d.target.x - d.source.x,
                        deltaY = d.target.y - d.source.y,
                        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                        normY = deltaY / dist,
                        //sourcePadding = Math.sqrt(d.source.size) * circle_size +10;
                        sourcePadding = d.source.size+10;
                    return d.source.y + (sourcePadding * normY);
                });
           */
                links.attr("d", linkArc);
                nodes.attr("cx", function(d) { return d.x; })
                        .attr("cy", function(d) { return d.y; });

                texts.attr("x", function(d) { return d.x  })
                        .attr("y", function(d) { return d.y  });
              }); //end force.on("tick") 
    };
    
    $('document').ready(function(){
        console.log("document ready");

        // initialize svg object
        svg = d3.select("#d3-container")
                .append("svg")
                    .attr("width", width)
                    .attr("height", height);

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
        // get target company number for query
        cid = $('#cid').text();
        restapi = $('#restapi').text();
        console.log("getting "+ cid + "from "+ restapi + "......");

        // get json through API
        $.getJSON("/cors?api="+ encodeURI(restapi) , function(data){
                
            console.log("cid = " + cid);
            
            /* buffer variable for more attributes */
            g_nodes = data.nodes;
            //g_links = links_post;
            g_links = data.links;


            $('#basicinfo').append("<p>Number of nodes: " + g_nodes.length + "</p>" );
            $('#basicinfo').append("<p>Number of links: " + g_links.length + "</p>" );

            force.nodes(g_nodes).links(g_links)
                .charge(-600)
                .linkDistance(200)
                .size([width, height])
                .start();
        
            update(); 
            
                  
        }); //end get JSON 
    }); //end document ready
    
})(jQuery);
