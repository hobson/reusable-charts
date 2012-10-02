// ======== standard_charts ========
// Standardized D3 charts (pie chart, line graph, etc)
// Copyright (c) 2012 Hobson Lane dba TotalGood, Inc
// Author: Hobson Lane hobson@totalgood.com
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

/* TODO: conform to d3 best practices for chart modules: 
http://bost.ocks.org/mike/chart/
*/

/* 
Closure function (function with persistent configuration values, like an object) 
attempt to immitate pattern at http://bost.ocks.org/mike/chart/ but doesn't work yet!
*/
function pieChart() {
    /* TODO: Add getters/setters per Mike Bostocks (D3 author) */

    var width  = 100,
        height = 100,
        wedges = {},
        r      = 100,
        title  = 'Default Title',
        divid  = '#notnecessary',
        css_class = 'pieplate',
        highlight_color = "rgb(210,226,105)", // mouseover highlight fill color
        x      = 0,
        y      = 0;

    /* TODO: per bostocks, this function should take no arguments but use closure variables above */
    function chart() { 
        var title_name = title.replace(/\s/g, ""); // create an selector id without spaces
        var canvas = d3.select(this).selectAll("svg").data(wedges);
        
        //    .attr("style","position: relative; left:0px; top:0px") // FIXME: put this in the CSS

        var svg = canvas.append("svg:svg") // create an SVG drawing/canvas inside <div id=divid>
            .attr("width",  r*2.0+0.5) //set width and height of the canvas (attributes of <svg> tag)
            .attr("height", r*2.0+0.5)
            .attr("class", css_class) // give the svg drawing a class ("pieplate") so we can style things outside the circle (title, labels)
            .attr("id", title_name ) // give this particular pie chart ("pieplate") an ID based on its unique Title
            .data([wedges])    // associate the svg object with the array of wedge values!
            .append("svg:g")      // make a group to contain just the piechart (stuff inside the circle)
            .attr("transform", "translate(" + r + "," + r + ")"); // move the center of the pie to the center of the "pieplate", the svg rectangle

        if (x && y) {
             svg = svg.attr("style","position: absolute; left:"+(x||"0px")+"; top:"+(y||"0px")+";"); }

        svg.append("svg:title")
           .text(title)
           
        // create svg <path> generator (yields path points) with a default innerRadius-, outerRadius-, startAngle- & endAngle-accessor functions
        var arc = d3.svg.arc().outerRadius(r);

        // create arc data for us given a list of values
        // unfortunately this cleans the data so the href and tooltip text tags aren't bound to the SVG path objects below
        var pie = d3.layout.pie().value(
                      // function to access value of each data element
                      function(d) { return d.value; }); 

        // arcs is the group containing all the wedges
        var arcs = svg.selectAll("g.piewedge") // select all <g> elements with class "piewedge" (aren't any yet)
            .data(pie) // associate the pie data (array of arcs with startAngle, endAngle, and value)
            .enter()   // create a <g> for every object in the data (pie, which contains arcs)
            .append("svg:g") // create group for each slice (<path>, <text>)
            .attr("id", function(d,i) { return wedges[i%N].css_id || "piewedge"+i;} )
            .attr("class", function(d,i) { return "piewedge "+wedges[i%N].css_class;} ); // give the group (slice) a class ("slice") so we can style things (like labels)

        // each call to color pushes values to its domain and range
        arcs.append("svg:path")
            .attr("fill", function(d, i) { return wedges[i%N].color; }) //set pie slice color
            .attr("d", arc) // create SVG path using d3.arc() and .data ("pie" object above)
            .on('mouseover', function(d,i) { 
                 d3.select(this)
                    .style('fill',highlight_color); }) // TODO: change or add a class rather than explitly changing the fill color (so CSS can control the color)
            .on('mouseout', function(d,i) { 
                 d3.select(this)
                   .style('fill', wedges[i%N].color ); })
            .on('mouseup', function(d,i) {
                  window.location.href = wedges[i].href; });

        arcs.append("svg:title")
           .text(function(d,i) { return wedges[i].tooltip; });
        
        //arcs.attr("class",function(d,i) { return "q"+i+"-9"; }) // Color Brewer labeling convention
        
        // to get really sexy, need to align the label between the edges of the wedge where the centerline of the text (or bounding box) leaves the wedge
        arcs.append("svg:text") //add a label to each slice
            .attr("transform", function(d) { // transform will move the text's origin (to the centroid of the arc)
                        // arc geometry setup for arc.centroid calc
                        d.innerRadius = 0;
                        d.outerRadius = chart.r;
                        ac = arc.centroid(d);
                        // move text down 5 pixels (to align text middle rather than bottom, if browser doesn't honor SVG vertical-align)
                        //ac[1] = ac[1]+5;  // "0.5ex"?
                        // move out away from origin 35% (where there's more room for text)
                        ac[0] = ac[0]*1.35; 
                        ac[1] = ac[1]*1.35; 
                        return "translate(" + ac + ")"; })//this gives us a pair of coordinates like [50, 50]
            .attr("dominant-baseline", "middle") // firefox+chrome -- http://stackoverflow.com/a/73257/623735 uses "hanging" , "central" are other options
            .attr("vertical-align", "middle") // nonMozilla browsers -- see dominant-baseline, 50% is an option here
            .attr("text-align", "middle") // nobody uses this -- https://groups.google.com/forum/?fromgroups=#!topic/mozilla.dev.tech.svg/G-DFbPv7MFM
            .attr("text-anchor", "middle") //center the text on it's origin
            .text(function(d, i) { return wedges[i].label; } ); //get the label from our original data array
        } // function chart()

    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
        }; 
        
    // chart.width getter/setter
    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart; // chart.width getter/setter
        }; // chart.height  getter/setter
        
  return chart;
} // function pieChart

/* http://bost.ocks.org/mike/chart/time-series-chart.js */
function timeSeriesChart() {
  var margin = {top: 20, right: 20, bottom: 20, left: 20},
      width = 760,
      height = 120,
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; },
      xScale = d3.time.scale(),
      yScale = d3.scale.linear(),
      xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(6, 0),
      area = d3.svg.area().x(X).y1(Y),
      line = d3.svg.line().x(X).y(Y);

  function chart(selection) {
    selection.each(function(data) {

      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      data = data.map(function(d, i) {
        return [xValue.call(data, d, i), yValue.call(data, d, i)];
      });

      // Update the x-scale.
      xScale
          .domain(d3.extent(data, function(d) { return d[0]; }))
          .range([0, width - margin.left - margin.right]);

      // Update the y-scale.
      yScale
          .domain([0, d3.max(data, function(d) { return d[1]; })])
          .range([height - margin.top - margin.bottom, 0]);

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg").append("g");
      gEnter.append("path").attr("class", "area");
      gEnter.append("path").attr("class", "line");
      gEnter.append("g").attr("class", "x axis");

      // Update the outer dimensions.
      svg .attr("width", width)
          .attr("height", height);

      // Update the inner dimensions.
      var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Update the area path.
      g.select(".area")
          .attr("d", area.y0(yScale.range()[0]));

      // Update the line path.
      g.select(".line")
          .attr("d", line);

      // Update the x-axis.
      g.select(".x.axis")
          .attr("transform", "translate(0," + yScale.range()[0] + ")")
          .call(xAxis);
    });
  }

  // The x-accessor for the path generator; xScale dot xValue.
  function X(d) {
    return xScale(d[0]);
  }

  // The x-accessor for the path generator; yScale dot yValue.
  function Y(d) {
    return yScale(d[1]);
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  return chart;
}

function xValue(d) { return d[0]; }
function yValue(d) { return d[1]; }
function lineLinear(points) { return points.join("L"); }
function d3_functor(v) {
    return typeof v === "function" ? v : function() { return v; }; }
// FIXME: equivalent to: d3_functor(true)
function fun_true() { return true; }
// identity projection is the default for mymarker
function my_identity(d) { return d; }
mymarker = function() { return my_marker(my_identity); };

function my_marker(projection) {
    function marker(data) {
        function segment() {
            segments.push("M", interpolate(projection(points), tension));
          }
          var segments = [], points = [], i = -1, n = data.length, d, fx = d3_functor(x), fy = d3_functor(y);
          while (++i < n) {
            if (defined.call(this, d = data[i], i)) {
              points.push([ +fx.call(this, d, i), +fy.call(this, d, i) ]);
            } else if (points.length) {
              segment();
              points = [];
            }
          }
          if (points.length) segment();
          return segments.length ? segments.join("") : null;
        }
    var x = xValue, y = yValue, defined = fun_true, interpolate = lineLinear, interpolateKey = interpolate.key, tension = .7;
    marker.x = function(_) {
      if (!arguments.length) return x;
      x = _;
      return marker;
    };
    marker.y = function(_) {
      if (!arguments.length) return y;
      y = _;
      return marker;
    };
    marker.defined = function(_) {
      if (!arguments.length) return defined;
      defined = _;
      return marker;
    };
    marker.interpolate = function(_) {
      if (!arguments.length) return interpolateKey;
      if (typeof _ === "function") interpolateKey = interpolate = _; else interpolateKey = (interpolate = lineLinear).key;
      return marker;
    };
    marker.tension = function(_) {
      if (!arguments.length) return tension;
      tension = _;
      return marker;
    };
    return marker;
    }

/* based on timeSeriesChart at http://bost.ocks.org/mike/chart/time-series-chart.js 
but doesn't work yet !!!!!!!!!!!!!!!!!!!! */
function scatterChart() {
  var margin = {top: 20, right: 20, bottom: 20, left: 20},
      width  = 760,
      height = 240,
      r      = Math.min(width,height)/30,
      xScale = d3.scale.linear(),
      yScale = d3.scale.linear(),
      xAxis  = d3.svg.axis().scale(xScale).orient("bottom").tickSize(6, 0),
      yAxis  = d3.svg.axis().scale(yScale).orient("left"  ).tickSize(6, 0),
      area   = null, //d3.svg.area().x(X).y1(Y), // why y1 instead of y? area and line must be allowed to have different y values
      marker = "circle",
      line = my_marker(my_identity).x(X).y(Y),
      tmp = 0;

  function chart(selection) {

    selection.each(function(data) {    // for each data point

      // Convert data to standard representation 
      data = data.map(function(d, i) {
        return [xValue.call(data, d, i), yValue.call(data, d, i)];
      });

      // Update the x-scale.
      xScale
          .domain(d3.extent(data, function(d) { return d[0]; }))
          .range([0, width - margin.left - margin.right]);

      // Update the y-scale.
      yScale
          .domain([0, d3.max(data, function(d) { return d[1]; })])
          .range([height - margin.top - margin.bottom, 0]);

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]); // assigns all the data at once?

      // Otherwise, create the skeletal chart.
      // WTF: can't be split into multiple lines, chain must be on one line!
      var gEnter = svg.enter().append("svg").append("g"); 
// WTF: this doesn't work:
//      var gEnter = svg.enter().append("svg");
//      gEnter.append("g"); 

      gEnter.append("path").attr("class", "area");
      gEnter.append("path").attr("class", "line").style("fill","white").style("stroke","gray");
      gEnter.append("g").attr("class", "x axis");

      gEnter.append("circle").attr("class","marker").style("stroke", "gray").style("fill", "#6773c7");
      // Update the markers.
      var mrksel = gEnter.select(".marker");
//          .attr("r", 10 )
//          .attr("cx", function(d,i) { return data[i][0]; } )
//          .attr("cy", function(d,i) { return data[i][1]; } );

      // Update the outer dimensions.
      svg.attr("width",  width)
         .attr("height", height);

      // Update the inner dimensions.
      var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Update the area path.
//      g.select(".area")
//          .attr("d", area ? area.y0(yScale.range()[0]): "");

      // Update the line path.
      g.select(".line")
          .attr("d", line);


      // Update the x-axis.
      g.select(".x.axis")
          .attr("transform", "translate(0," + yScale.range()[0] + ")")
          .call(xAxis);

      // Update the y-axis.
      g.select(".y.axis")
          .attr("transform", "translate(0," + xScale.range()[0] + ")")
          .call(yAxis);
    });
  }

  // The x-accessor for the path generator; xScale âˆ˜ xValue.
  function X(d) {
    return xScale(d[0]);
  }

  // The x-accessor for the path generator; yScale âˆ˜ yValue.
  function Y(d) {
    return yScale(d[1]);
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  return chart;
} // function timeSeriesChart


function get_columns(x,y) {
    if (typeof(x) === "undefined") { var x=[]; }
    if (typeof(y) === "undefined") { 
        var y=[];
        if ( x.length && x[0] && x[0].length === 2 ) // if x is a list of pairs 
            for (var yi in x) y.push(yi);
        else if ( x.length === 2 )  // if x is a pair of lists
            for (var yi in x[1]) y.push(yi); 
        else for (var yi in x) y.push(0);
        } // if y undefined
    return [x,y]; }

function munge_selector(divid,defaultid) {
    if (!divid.length || divid[0] != "#") 
        divid = "#"+divid;
    divid = divid.length > 1 ? divid : defaultid;
    return divid
    }

// set a default value for a numerical function argument if it isn't supplied (or undefined)
// FIXME: check that the arg and the default are strings and coerce
function default_number(arg,default_value) {
    if (typeof(arg) === "undefined")
        if (typeof(default_value) != "undefined") arg = +default_value;
        else arg = 0;
    return +arg; }

// set a default value for a string function argument if it isn't supplied (or undefined)
// FIXME: check that the arg and the default are strings and coerce
function default_string(arg,default_value) {
    if (typeof(arg) === "undefined")
        if (typeof(default_value) != "undefined") arg = ""+default_value;
        else arg = "";
    return ""+arg; }

function draw_circle(canvas,r,cx,cy,stroke,fill) {
    canvas.append("circle")
        .style("stroke", stroke)
        .style("fill", fill)
        .attr("r", r)
        .attr("cx", cx)
        .attr("cy", cy);
    return canvas;
    }

function draw_diamond(canvas,r,cx,cy,stroke,fill) {
    canvas.append("path")
        .attr("d", "M"+(cx+r)+","+(cy+0)+"L"+(cx+0)+","+(cy+r)+"L"+(cx-r)+","+(cy+0)+"L"+(cx+0)+","+(cy-r)+"Z")
        .style("stroke", stroke)
        .style("fill", fill); // M=move,L=line,Z=close_up_shape
    return canvas;
    }

function add_geo_scatter_chart(divid,x,y,marker,r,height,width,stroke,fill) {
    divid =munge_selector(divid,"#map");
    marker=default_string(marker,"diamond");
    stroke=default_string(stroke,"#447");
    fill  =default_string(fill,"#6773b7");
    r     =default_number(r,5);
    height=default_number(height,610);
    width =default_number(width,920); 
    
    if (marker[0] === "d" || marker[0] === "D" ) markfun=draw_diamond;
    else markfun = draw_circle;

    xy = get_columns(x,y); x=xy[0]; y=xy[1];

    var N=Math.min(x.length,y.length)
    var minX=Math.min.apply( null, x ); 
    var maxX=Math.max.apply( null, x );
    var minY=Math.min.apply( null, y );
    var maxY=Math.max.apply( null, y );
    var Cx = (maxX+minX)*0.5 // map horizontal (east-west) center in degrees
    var Cy = (maxY+minY)*0.5 // map horizontal (east-west) center in degrees
    var Cx_rad = deg2rad(Cx);
    var Cy_rad = deg2rad(Cy);
    
    // convert to linear distance in meters relative to center/origin, with down positive and right positive
    for (i = 0; i < N; i++) { 
        x[i] = deg2rad(x[i]-Cx)*radlon2m(Cy_rad);
        y[i] = deg2rad(Cy-y[i])*radlat2m(Cy_rad);  // Cy unnecessary
    }
    // Distance calcs assume spherical earth, which means ~.1% inacuracy for all calcs
    
    var marginX = 40,  marginY = 30;  // size of clear margin around perimeter of map canvas

    // data bounds in meters relative to center
    var minX_m=Math.min.apply( null, x ); 
    var maxX_m=Math.max.apply( null, x );
    var minY_m=Math.min.apply( null, y );
    var maxY_m=Math.max.apply( null, y ); 

    var sfX =(width-2*marginX)/(maxX_m-minX_m);
    var sfY =(height-2*marginY)/(maxY_m-minY_m); 
    // maintain orthographic scale (don't stretch to fit canvas)
    sfX = Math.min(sfX,sfY); sfY=sfX;
    function Xscale(value,i,values) {
        return (value-minX_m)*sfX; }
    function Yscale(value,i,values) {
        return (value-minY_m)*sfY; }
    
    // sfX = sfY = 0.0031899591573045817 // assumes square pixels
    // minX_m = -134835.72265379986
    // minY_m = -87775.41849049611
    
    x = x.map(Xscale)
    y = y.map(Yscale) 

    // create a canvas to draw an SVG drawing on
    var canvas = d3.select(divid).append("svg")
        .attr("width", width).attr("height", height);
    
    // add a large gray dot for each x,y coordinate computed
    for (i = 0; i < N; i++) 
        canvas = markfun(canvas,r,marginX+x[i],marginY+y[i],stroke,fill);
    } // function add_geo_scatter


// non-closured function
function add_pie_chart(divid,wedges,r,title,css_class,highlight_color,x,y) {
    divid = munge_selector(divid,"#piemap");
    xy = get_columns(x,y); x=xy[0]; y=xy[1];
    
    var N = wedges.length
    // mouseover highlight fill color
    if (typeof(highlight_color) === "undefined") {
        highlight_color = "rgb(210,226,105)";     } 
    var css_class = css_class || "pieplate";
    
    // set up an SVG object within the specified <div>
    var title_name = title.replace(/\s/g, "");

    var canvas = d3.select(divid); // select the parent that may already contain multiple chilren (SVG charts)

    var svg = canvas.append("svg:svg") // create a new SVG element for drawing inside (child of) the parent <div id=divid>
        .attr("width",  r*2.0+0.5) //set width and height of the canvas (attributes of <svg> tag)
        .attr("height", r*2.0+0.5)
        .attr("class", css_class) // give the svg drawing a class ("pieplate") so we can style things outside the circle (title, labels)
        .attr("id", title_name ) // give this particular pie chart ("pieplate") an ID based on its unique Title
        .data([wedges])    // associate the svg object with the array of wedge values!
        .append("svg:g")      // make a group to contain just the piechart (stuff inside the circle)
        .attr("transform", "translate(" + r + "," + r + ")"); // move the center of the pie to the center of the "pieplate", the svg rectangle

    if (x && y) {
         svg = svg.attr("style","position: absolute; left:"+(x||"0px")+"; top:"+(y||"0px")+";"); }

    svg.append("svg:title")
       .text(title)
       
    // create svg <path> generator (yields path points) with a default innerRadius-, outerRadius-, startAngle- & endAngle-accessor functions
    var arc = d3.svg.arc().outerRadius(r);

    // create arc data for us given a list of values
    // unfortunately this cleans the data so the href and tooltip text tags aren't bound to the SVG path objects below
    var pie = d3.layout.pie().value(
                  // function to access value of each data element
                  function(d) { return d.value; }); 

    // arcs is the group containing all the wedges
    var arcs = svg.selectAll("g.piewedge") // select all <g> elements with class "piewedge" (aren't any yet)
        .data(pie) // associate the pie data (array of arcs with startAngle, endAngle, and value)
        .enter()   // create a <g> for every object in the data (pie, which contains arcs)
        .append("svg:g") // create group for each slice (<path>, <text>)
        .attr("id", function(d,i) { return wedges[i%N].css_id || "piewedge"+i;} )
        .attr("class", function(d,i) { return "piewedge "+wedges[i%N].css_class;} ); // give the group (slice) a class ("slice") so we can style things (like labels)

    // each call to color pushes values to its domain and range
    arcs.append("svg:path")
        .attr("fill", function(d, i) { return wedges[i%N].color; }) //set pie slice color
        .attr("d", arc) // create SVG path using d3.arc() and .data ("pie" object above)
        .on('mouseover', function(d,i) { 
             d3.select(this) // local "this" and not global?
                .style('fill',highlight_color); }) // TODO: change or add a class rather than explitly changing the fill color (so CSS can control the color)
        .on('mouseout', function(d,i) { 
             d3.select(this)
               .style('fill', wedges[i%N].color ); })
        .on('mouseup', function(d,i) {
              window.location.href = wedges[i].href; });

    arcs.append("svg:title")
       .text(function(d,i) { return wedges[i].tooltip; });
    
    //arcs.attr("class",function(d,i) { return "q"+i+"-9"; }) // Color Brewer labeling convention
    
    // to get really sexy, need to align the label between the edges of the wedge where the centerline of the text (or bounding box) leaves the wedge
    arcs.append("svg:text") //add a label to each slice
        .attr("transform", function(d) { // transform will move the text's origin (to the centroid of the arc)
                    // arc geometry setup for arc.centroid calc
                    d.innerRadius = 0;
                    d.outerRadius = chart.r;
                    ac = arc.centroid(d);
                    // move text down 5 pixels (to align text middle rather than bottom, if browser doesn't honor SVG vertical-align)
                    //ac[1] = ac[1]+5;  // "0.5ex"?
                    // move out away from origin 35% (where there's more room for text)
                    ac[0] = ac[0]*1.35; 
                    ac[1] = ac[1]*1.35; 
                    return "translate(" + ac + ")"; })//this gives us a pair of coordinates like [50, 50]
        .attr("dominant-baseline", "middle") // firefox+chrome -- http://stackoverflow.com/a/73257/623735 uses "hanging" , "central" are other options
        .attr("vertical-align", "middle") // nonMozilla browsers -- see dominant-baseline, 50% is an option here
        .attr("text-align", "middle") // nobody uses this -- https://groups.google.com/forum/?fromgroups=#!topic/mozilla.dev.tech.svg/G-DFbPv7MFM
        .attr("text-anchor", "middle") //center the text on it's origin
        .text(function(d, i) { return wedges[i].label; } ); //get the label from our original data array
    } // function add_pie_chart()

function json_or_object(data,default_value) {
    var typ = typeof data;
    if (typ === "object") return data;
    if (typ != "string") return default_value;
    if ((data.length>256) && (data[0]==='['))
        return JSON.parse(data);
    return d3.json(data); // $.getJSON(data);
    }

/* from http://mbostock.github.com/d3/ex/pack.html */
function add_packed_bubbles(divid,data_arg,height_arg,width_arg,x,y){
    // chart configuration variables
    var height = 720,
        width  = 960,
        x0 = 2,
        y0 = 2,
        // margin = {top: 20, right: 20, bottom: 20, left: 20}, 
        // xScale = d3.scale.linear(),
        // yScale = d3.scale.linear(),
        // xAxis  = d3.svg.axis().scale(xScale).orient("bottom").tickSize(6, 0),
        // yAxis  = d3.svg.axis().scale(yScale).orient("left"  ).tickSize(6, 0),
        data = { "name": "Root Name", "children": [
                 { "name": "Child 1","children": [ 
                    { "name": "Grandchild 1.1", "children": [
                      {"name": "GGchild 1.1.1", "size": 111 },
                      {"name": "GGchild 1.1.2", "size": 211 },
                      {"name": "GGchild 1.1.3", "size": 311 },
                      {"name": "GGchild 1.1.4", "size": 411 } ] },
                    { "name": "Grandchild 1.2", "children": [
                      {"name": "GGchild 1.2.1", "size": 121 },
                      {"name": "GGchild 1.2.2", "size": 221 },
                      {"name": "GGchild 1.2.3", "size": 321 } ] },
                    { "name": "Grandchild 1.3", "children": [
                      {"name": "GGchild 1.3.1", "size": 131 },
                      {"name": "GGchild 1.3.2", "size": 231 } ] } ] },
                 { "name": "Child 2", "children": [ 
                    { "name": "Grandchild 1.1", "children": [
                      {"name": "GGchild 2.1.1", "size": 112 },
                      {"name": "GGchild 2.1.2", "size": 212 },
                      {"name": "GGchild 2.1.3", "size": 312 } ] } ] } ] };

    // process positional arguments, assigning defaults as necessary
    divid  = munge_selector(divid,     "#chart");
    data   = json_or_object(data_arg,  data);
    height = default_number(height_arg,height);
    width  = default_number(width_arg, width);
    x0     = default_number(x0_arg,    x0);
    y0     = default_number(y0_arg,    y0);
    
    // this overwrites any existing "innerHtml" content with new styles
    // I'm sure d3 has a better way to import a style sheet, but...
    var divsel = d3.select(divid).html("<link href='packed_bubbles.css' rel='stylesheet' type='text/css' />");
    
    var format = d3.format(",d");

    var pack = d3.layout.pack()
        .size([width - 4, height - 4])
        .value(function(d) { return d.size; });

    var vis = d3.select(divid).append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "pack")
      .append("g")
        .attr("transform", "translate("+x0+","+y0+")");

    // d3.json("flare.json", function(json) {
    
    function plot_data(json) {
        var node = vis.data([json]).selectAll("g.node")
            .data(pack.nodes)
            .enter().append("g")
            .attr("class", function(d) { return d.children ? "node" : "leaf node"; })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
//            .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")" });

        node.append("title")
            .text(function(d) { return d.name + (d.children ? "" : ": " + format(d.size)); });

        node.append("circle")
            .attr("r", function(d) { return d.r; });

        node.filter(function(d) { return !d.children; }).append("text")
            .attr("text-anchor", "middle")
            .attr("dy", ".3em")
            .text(function(d) { return d.name.substring(0, d.r / 3); });
        return node.length
        }
    
    return plot_data(data);
    } // function add_packed_bubbles

function add_packed_bubbles_list(divid,data,height,width) {
    for (var i=0; i<data.length; i++) {
        chart = charts[i];
        divid="bubblemap";
        var r = 25;
        for (var j=0; j<chart.values.length; j++) {
            wedges[j] = { "label":   chart.labels[j], 
                          "value":   chart.values[j], 
                          "href":    "/report/"+chart.ids[j],
                          "tooltip":     chart.values[j]+" beds in "+chart.names[j],
                          "css_class"  : "", // "piewedge"
                          "css_id"     : divid+"-piewedge-"+j,
                          "r"          : j<num_big_wedges ? chart.r : chart.r*1.35,
                          "color"      : j<num_big_wedges ? hot[j%hot.length] : cool[j%cool.length],
                          "highlight_color": "rgb(210,226,105)",
                         }; 
            if (j<num_big_wedges) {
                wedges[j]["color"] = hot[j%hot.length]; }
            else {
                wedges[j]["color"] = cool[j%cool.length]; }
            //document.write(wedges[j].tooltip+"<br>");
            } // for each wedge
        //add_pie_chart(divid,wedges, r, chart.title,"pieplate");
        //add_packed_bubbleS(); // FIXME
        } // for each set of bubbles in the list
    } // function add_packed_bubbles_list()

// set a default value for a numerical function argument if it isn't supplied (or undefined)
// FIXME: check that the arg and the default are strings and coerce
function default_number_list(arg,default_value) {
    if (typeof(arg) === "undefined")
        if (typeof(default_value) != "undefined") arg = default_value;
        else arg = [];
    return arg; }

// set a default value for a string function argument if it isn't supplied (or undefined)
// FIXME: check that the arg and the default are strings and coerce
function default_list(arg,default_value) {
    if (typeof(arg) === "undefined")
        if (typeof(default_value) != "undefined") arg = default_value;
        else arg = [];
    return arg; }

function add_pie_chart_list(divid,charts,piesizes, num_big_wedges,hot,cool,independent) {
    divid =          munge_selector(divid,"#piemap");
    divid_name =     divid.replace('#','');
    piesizes =       default_number_list(piesizes,[50, 50, 50, 50, 50, 50, 100]);
    num_big_wedges = default_number(num_big_wedges,2);
    hot   =          default_list(hot, ['#C71','#B41','#C62', '#930','#E74']);  
    independent =    default_list(independent,['#CCC']);
    cool =           default_list(cool, ['#999','#888','#666','#888','#999','#666']);// ['#9ecae1','#c6dbef'];
    for (var i=0; i<Math.min(charts.length,piesizes.length); i++) {
        chart = charts[i];
        var wedges = [];
        var r = piesizes[i];
        var title_name = chart.title.replace(/\s/g, "");
        if (r<1) { r = chart.r; }
        for (var j=0; j<chart.values.length; j++) {
            if (chart.values[j]>0) {
                console.log(j+'='+chart.values[j]+'('+chart.title)
                wedges[j] = { "label":   chart.labels[j], 
                              "value":   chart.values[j], 
                              "href":    "/report/"+chart.ids[j],
                              "tooltip":     chart.values[j]+" beds in "+chart.names[j],
                              "css_class"  : "", // "piewedge"
                              "css_id"     : divid_name+'-'+title_name+"-piewedge-"+j,  // each chart can be positioned using CSS, opacity is also by CSS
                              "r"          : chart.r, //j<num_big_wedges ? chart.r : chart.r*1.35,
                              "color"      : j<num_big_wedges ? hot[j%hot.length] : cool[j%cool.length],
                              "highlight_color": "rgb(210,226,105)",
                             }; 
                if (j<num_big_wedges) {
                    wedges[j]["color"] = hot[j%hot.length]; }
                else {
                    wedges[j]["color"] = cool[j%cool.length]; }
                } // if chart.values>0
            } // for each wedge
            add_pie_chart(divid,wedges, r, chart.title, "pieplate");
        } // for each chart
    } // function add_pie_chart_list

function add_scattered_packed_bubbles(divid,x,y,marker,r,height,width,stroke,fill) {
    divid =munge_selector(divid,"#map");
    marker=default_string(marker,"diamond");
    stroke=default_string(stroke,"#447");
    fill  =default_string(fill,"#6773b7");
    r     =default_number(r,5);
    height=default_number(height,610);
    width =default_number(width,920); 
    
    if (marker[0] === "d" || marker[0] === "D" ) markfun=draw_diamond;
    else markfun = draw_circle;

    xy = get_columns(x,y); x=xy[0]; y=xy[1];

    var N=Math.min(x.length,y.length)
    var minX=Math.min.apply( null, x ); 
    var maxX=Math.max.apply( null, x );
    var minY=Math.min.apply( null, y );
    var maxY=Math.max.apply( null, y );
    var Cx = (maxX+minX)*0.5 // map horizontal (east-west) center in degrees
    var Cy = (maxY+minY)*0.5 // map horizontal (east-west) center in degrees
    var Cx_rad = deg2rad(Cx);
    var Cy_rad = deg2rad(Cy);
    
    // convert to linear distance in meters relative to center/origin, with down positive and right positive
    for (i = 0; i < N; i++) { 
        x[i] = deg2rad(x[i]-Cx)*radlon2m(Cy_rad);
        y[i] = deg2rad(Cy-y[i])*radlat2m(Cy_rad);  // Cy unnecessary
    }
    // Distance calcs assume spherical earth, which means ~.1% inacuracy for all calcs
    
    var marginX = 40,  marginY = 30;  // size of clear margin around perimeter of map canvas

    // data bounds in meters relative to center
    var minX_m=Math.min.apply( null, x ); 
    var maxX_m=Math.max.apply( null, x );
    var minY_m=Math.min.apply( null, y );
    var maxY_m=Math.max.apply( null, y ); 

    var sfX =(width-2*marginX)/(maxX_m-minX_m);
    var sfY =(height-2*marginY)/(maxY_m-minY_m); 
    // maintain orthographic scale (don't stretch to fit canvas)
    sfX = Math.min(sfX,sfY); sfY=sfX;
    function Xscale(value,i,values) {
        return (value-minX_m)*sfX; }
    function Yscale(value,i,values) {
        return (value-minY_m)*sfY; }
    
    // sfX = sfY = 0.0031899591573045817 // assumes square pixels
    // minX_m = -134835.72265379986
    // minY_m = -87775.41849049611
    
    x = x.map(Xscale)
    y = y.map(Yscale) 

//    bubbles = { "name": "Clusters", "children": [
//                {"name": "0", "x": x[0], "y": y[0], "children": [ ] }] };
//    for (var i=0; i<x.length; i++) {
//        for (var j=0; i<bubbles.children.length; j++) {
//            if x[i]-bubbles 
//            }
//        }

    // create a canvas to draw an SVG drawing on
    var canvas = d3.select(divid).append("svg")
        .attr("width", width).attr("height", height);
    
    // add a large gray dot for each x,y coordinate computed
    for (i = 0; i < N; i++) 
        canvas = markfun(canvas,r,marginX+x[i],marginY+y[i],stroke,fill);
    } // function add_geo_scatter

