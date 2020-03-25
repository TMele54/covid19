function multiline(data){

    // variables for interactivity - focus on hovered line
    var duration = 250;

    var lineOpacity = "0.6";
    var lineOpacityHover = "0.85";
    var otherLinesOpacityHover = "0.4";


    // Draw a line chart
    var svg = d3.select('.svgML'),
        margin = { top: 20, right:80, bottom: 30, left: 50 },
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom,
        g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var div = d3.select(".svg-wrapper").append("div").attr("class", "toolTip");
    var parseTime = d3.time.format('%Y-%m-%d %H:%M').parse;
    var formatTime = d3.time.format('%e %B');

    var x = d3.time.scale().range([0, width], 0.5);

    var y = d3.scale.linear().range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis().scale(x).tickSize(-height).orient("bottom");

    var yAxis = d3.svg.axis().scale(y).orient("left");

    var line = d3.svg.line()
        .x(function(d) {
          return x(d.date);
        })
        .y(function(d) {
      return y(d.attackType);
    });

     // Select the important columns
    color.domain(d3.keys(data[0]).filter(function(key) {
          return key !== "Time" && key !== "_id";
      }));
    // Correct the types
    data.forEach(function(d) {
    d.date = parseTime(d.Time);
    });

    var attackTypes = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {
          date: d.date,
          attackType: +d[name]
        };
      })
    };
    });


    x.domain(d3.extent(data, function(d) {
    return d.date;
    }));
    y.domain([
    d3.min(attackTypes, function(c) {
      return d3.min(c.values, function(v) {
        return v.attackType;
      });
    }),
    d3.max(attackTypes, function(c) {
      return d3.max(c.values, function(v) {
        return v.attackType;
      });
    })
    ]);

    g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Set the Y axis
    g.append("g").attr("class", "y axis").call(yAxis);

    // Draw the lines
    var attacker = g.selectAll(".attacker")
        .data(attackTypes)
        .enter().append("g")
        .attr("class", "attacker");

    attacker.append("path")
        .attr("class", "line")
        .attr("d", function(d) {
          return line(d.values);
        })
        .style("stroke", function(d) {
          return color(d.name);
        })
        // .style('opacity', lineOpacity)
        .on("mouseover", function(d) {
        d3.selectAll('.line')
            .style('opacity', otherLinesOpacityHover);
        d3.selectAll('.circle')
            .style('opacity', circleOpacityOnLineHover);
        d3.select(this)
          .style('opacity', lineOpacityHover)
          .style("stroke-width", lineStrokeHover)
          .style("cursor", "pointer");
      });

    // Add the circles
    attacker.append("g").selectAll("circle")
        .data(function(d){return d.values})
        .enter()
        .append("circle")
        .attr("r", 3)
        .attr("cx", function(dd){return x(dd.date)})
        .attr("cy", function(dd){return y(dd.attackType)})
        .attr("fill", "none")
        .attr("stroke", function(d){return color(this.parentNode.__data__.name)});

    attacker.append("text")
        .attr("class", "label")
        .datum(function (d) {
        return {
        name: d.name,
        value: d.values[d.values.length - 1]
        };
        })
        .attr("transform", function (d) {
        return "translate(" + x(d.value.date) + "," + y(d.value.attackType) + ")";
        })
        .attr("x", 10)
        .attr("dy", ".35em")
        .attr("fill", function(d){return color(this.parentNode.__data__.name)})
        .text(function (d) {
              return d.name;
          });

    // Add the mouse line
    var mouseG = g.append("g")
        .attr("class", "mouse-over-effects");

    mouseG.append("path")
        .attr("class", "mouse-line")
        .style("stroke", "rgba(255,255,255,.3)")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    var lines = document.getElementsByClassName('line');

    var mousePerLine = mouseG.selectAll('.mouse-per-line')
        .data(attackTypes)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
        .attr("r", 5)
        .style("stroke", function (d) {
        return color(d.name);
        })
        // .style("fill", "none")
        .style("stroke-width", "2px")
        .style("opacity", "0");

    mousePerLine.append("text")
        .attr("class", "hover-text")
        .attr("dy", "-1em")
        .attr("transform", "translate(10,3)")
        .attr("fill", function(d){return color(this.parentNode.__data__.name)});

    // Append a rect to catch mouse movements on canvas
    mouseG.append('svg:rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseout', function () { // on mouse out hide line, circles and text
        d3.select(".mouse-line")
          .style("opacity", ".2");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "0");
        })
        .on('mouseover', function () { // on mouse in show line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "1");
        })
        .on('mousemove', function () { // mouse moving over canvas
        var mouse = d3.mouse(this);

        d3.selectAll(".mouse-per-line")
          .attr("transform", function (d, i) {

            var xDate = x.invert(mouse[0]),
              bisect = d3.bisector(function (d) { return d.date; }).left;
            idx = bisect(d.values, xDate);

            d3.select(this).select('text')
              .text(y.invert(y(d.values[idx].attackType)).toFixed(0) );

            d3.select(".mouse-line")
              .attr("d", function () {
                var data = "M" + x(d.values[idx].date) + "," + height;
                data += " " + x(d.values[idx].date) + "," + 0;
                return data;
              });
            return "translate(" + x(d.values[idx].date) + "," + y(d.values[idx].attackType) + ")";
          });
      });

}


      // load the data
d3.json("https://api.myjson.com/bins/rczxa", function(data) {
    data.forEach(function(d){
        console.log(JSON.stringify(d))
    })
    multiline(data)
});

//call_data()