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
attempt to immitate pattern at http://bost.ocks.org/mike/chart/  
*/
function pieChart() {
    /* TODO: Add getters/setters per Mike Bostocks (D3 author) */

    var width  = 100,
        height = 100,
        wedges = {},
        r      = 100,
        title  = 'Default Region',
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
            .attr("id", title_name ) // give this particular pie chart ("pieplate") an ID based on its unique region name, so Paul can position them individually
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

  // The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(d[0]);
  }

  // The x-accessor for the path generator; yScale ∘ yValue.
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

// identity projection is the default for a line
function my_identity(d) {
    return d;
}

myline = function() {
    return my_line(my_identity);
  };

function my_line(projection) {
    function line(data) {
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
    line.x = function(_) {
      if (!arguments.length) return x;
      x = _;
      return line;
    };
    line.y = function(_) {
      if (!arguments.length) return y;
      y = _;
      return line;
    };
    line.defined = function(_) {
      if (!arguments.length) return defined;
      defined = _;
      return line;
    };
    line.interpolate = function(_) {
      if (!arguments.length) return interpolateKey;
      if (typeof _ === "function") interpolateKey = interpolate = _; else interpolateKey = (interpolate = lineLinear).key;
      return line;
    };
    line.tension = function(_) {
      if (!arguments.length) return tension;
      tension = _;
      return line;
    };
    return line;
    }

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


/* based on timeSeriesChart at http://bost.ocks.org/mike/chart/time-series-chart.js */
function scatterChart() {
  var margin = {top: 20, right: 20, bottom: 20, left: 20},
      width  = 760,
      height = 240,
      r      = Math.min(width,height)/30,
      xValue = function(d) { return d[0]; },// TODO: assign to global xValue function
      yValue = function(d) { return d[1]; }, // TODO: assign to global yValue function
      xScale = d3.scale.linear(),
      yScale = d3.scale.linear(),
      xAxis  = d3.svg.axis().scale(xScale).orient("bottom").tickSize(6, 0),
      yAxis  = d3.svg.axis().scale(yScale).orient("left"  ).tickSize(6, 0),
      area   = null, //d3.svg.area().x(X).y1(Y), // why y1 instead of y? area and line must be allowed to have different y values
      marker = "circle",
      line = d3.svg.symbol; //.cx(X).cy(Y);

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
      gEnter.append("path").attr("class", "marker").style("fill","white").style("stroke","gray").attr("transform", function(d) { return "translate(" + X + "," + Y + ")"; }).attr("d", d3.svg.symbol());
      //
      //gEnter.append("circle").attr("class","marker").style("stroke", "gray").style("fill", "#6773c7");
      gEnter.append("g").attr("class", "x axis");

      // Update the outer dimensions.
      svg .attr("width", width)
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

      // Update the markers.
      g.select(".marker")
          .attr("class", "marker").style("fill","white").style("stroke","gray").attr("transform", "translate(" + X + "," + Y + ")"; }).attr("d", d3.svg.symbol());
//          .attr("r", r)
//          .attr("cx", X) // X = xScale(d[0])
//          .attr("cy", Y); // Y = yScale(d[1])

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
  function X(d) { return xScale(d[0]); }

  // The x-accessor for the path generator; yScale âˆ˜ yValue.
  function Y(d) { return yScale(d[1]); }

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

// non-closured function
function add_pie_chart(wedges,r,title,divid,css_class,highlight_color,x,y) { 
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
        .attr("id", title_name ) // give this particular pie chart ("pieplate") an ID based on its unique region name, so Paul can position them individually
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
    } // function chart()
