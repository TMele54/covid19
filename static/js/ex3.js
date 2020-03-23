
var pthData = "./static/data/NYC_crime_sampled-with-random-days_n10000.csv"

var marginTitle = { top: 20, left: 50},
    mapWidth = 600,
    mapHeight = 300;

var mapSvg = d3.select("#map-container").append("svg")
    .attr("width", mapWidth)
    .attr("height", mapHeight);

var title = mapSvg.append("text")
    .attr("class", "vis-title")
    .attr("transform", "translate(" + marginTitle.left + "," + marginTitle.top + ")")
    .text("NYC Crimes (select a time range)");

var projection = d3.geo.mercator() // mercator makes it easy to center on specific lat/long
    .scale(30000)
    .center([-73.8, 40.56]); // long, lat of NYC

var pathGenerator = d3.geo.path()
    .projection(projection);

var colorScale  = d3.scale.category10();

var radiusScale = d3.scale.sqrt()
    .range([2, 15]);

// Add the tooltip container to the vis container
// it's invisible and its position/contents are defined during mouseover
var tooltip = d3.select("#map-container").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// tooltip mouseover event handler
function tipMouseover(d) {
    this.setAttribute("class", "circle-hover"); // add hover class to emphasize

    var color = colorScale(d.CR);
    var html  = "<span style='color:" + color + ";'>" + d.CR + "</span><br/>" +
                "Count: " + d.TOT + "<br/>Date: " + d.MO + "/" + d.YR;

    tooltip.html(html)
        .style("left", (d3.event.pageX + 15) + "px")
        .style("top", (d3.event.pageY - 28) + "px")
      .transition()
        .duration(200) // ms
        .style("opacity", .9) // started as 0!
};

// tooltip mouseout event handler
function tipMouseout(d) {
    this.classList.remove("circle-hover"); // remove hover class

    tooltip.transition()
        .duration(500) // ms
        .style("opacity", 0); // don't care about position!
};

makeMap();

function makeMap() {
    d3.json("../static/js/NYCboroughs.geojson.json", function(error, boroughs) {
        if (error) return console.error(error);

        mapSvg.selectAll("path")
            .data(boroughs.features)
          .enter().append("path")
            .attr("class", "boroughs")
            .attr("d", pathGenerator);

        getCrimeData();
    });
}

// Loads and munges NYC crime data.
// Calls updateMapPoints() and makeLegend()
function getCrimeData() {
    d3.csv(pthData, function(error, dataForMap) {
        if (error) return console.error(error);

        var parseMonthDayYear = d3.time.format("%m/%d/%Y").parse;

        var dataForTimeline = [],
            dateToCrimeCount = {};

        dataForMap.forEach(function(d, idx) {
            d.TIME = parseMonthDayYear(d.TIME);
            d.TOT = +d.TOT;
            d.latitude = +d.latitude;
            d.longitude = +d.longitude;
            colorScale(d.CR);

            if (!dateToCrimeCount[d.TIME]) {
                dateToCrimeCount[d.TIME] = d.TOT;
            } else {
                dateToCrimeCount[d.TIME] += d.TOT;
            }
        });
        Object.keys(dateToCrimeCount).forEach(function(time) {
            dataForTimeline.push({ TIME: new Date(time), TOT: dateToCrimeCount[time] });
        });
        dataForTimeline.sort(function(a,b) { return a.TIME - b.TIME; });

        radiusScale.domain(d3.extent(dataForMap, function(crime) { return +crime.TOT; }));

        makeTimeline(dataForMap, dataForTimeline);
        makeLegend();
    });
};

// Creates the event timeline and sets up callbacks for brush changes
function makeTimeline(dataForMap, dataForTimeline) {
    var margin = { top: 10, right: 10, bottom: 20, left: 25 },
        width  = mapWidth - margin.left - margin.right,
        height = 80 - margin.top  - margin.bottom;

    var timelineSvg = d3.select("#timeline-container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var timeline = timelineSvg.append("g")
        .attr("class", "timeline")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.time.scale()
        .domain(d3.extent(dataForTimeline.map(function(d) { return d.TIME; })))
        .range([0, width]);

    var y = d3.scale.linear()
        .domain(d3.extent(dataForTimeline.map(function(d) { return d.TOT; })))
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(2);

    var area = d3.svg.area()
        .interpolate("linear")
        .x(function(d) { return x(d.TIME); })
        .y0(height)
        .y1(function(d) { return y(d.TOT); });

    timeline.append("path")
        .datum(dataForTimeline)
        .attr("class", "area")
        .attr("d", area);

    timeline.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    timeline.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    timeline.append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", "1em")
        .style("text-anchor", "end")
        .text("# Crimes");

    // Add brush to timeline, hook up to callback
    var brush = d3.svg.brush()
        .x(x)
        .on("brush", function() { brushCallback(brush, dataForMap); })
        .extent([new Date("12/1/2013"), new Date("1/1/2014")]); // initial value

    timeline.append("g")
        .attr("class", "x brush")
        .call(brush)
      .selectAll("rect")
        .attr("y", -6)
        .attr("height", height + 7);

    brush.event(timeline.select('g.x.brush')); // dispatches a single brush event
};

// Called whenever the timeline brush range (extent) is updated
// Filters the map data to those points that fall within the selected timeline range
function brushCallback(brush, dataForMap) {
    if (brush.empty()) {
        updateMapPoints([]);
        updateTitleText();
    } else {
        var newDateRange = brush.extent(),
            filteredData = [];

        dataForMap.forEach(function(d) {
            if (d.TIME >= newDateRange[0] && d.TIME <= newDateRange[1]) {
                filteredData.push(d);
            }
        });
        updateMapPoints(filteredData);
        updateTitleText(newDateRange);
    }
}

// Updates the vis title text to include the passed date array: [start Date, end Date]
function updateTitleText(newDateArray) {
    if (!newDateArray) {
        title.text("NYC Crimes (select a time range)");
    } else {
        var from = (newDateArray[0].getMonth() + 1) + "/" +
                   (newDateArray[0].getDay() + 1) + "/" +
                   newDateArray[0].getFullYear(),
            to =   (newDateArray[1].getMonth() + 1) + "/" +
                   (newDateArray[1].getDay() + 1) + "/" +
                   newDateArray[1].getFullYear();
        title.text("NYC Crimes " + from + " - " + to);
    }
}

// Updates the points displayed on the map, to those in the passed data array
function updateMapPoints(data) {
    var circles = mapSvg.selectAll("circle").data(data, function(d) { return d.TIME + d.TOT; });

    circles // update existing points
        .on("mouseover", tipMouseover)
        .on("mouseout", tipMouseout)
        .attr("fill", function(d) { return colorScale(d.CR); })
        .attr("cx", function(d) { return projection([+d.longitude, +d.latitude])[0]; })
        .attr("cy", function(d) { return projection([+d.longitude, +d.latitude])[1]; })
        .attr("r",  function(d) { return radiusScale(+d.TOT); });

    circles.enter().append("circle") // new entering points
        .on("mouseover", tipMouseover)
        .on("mouseout", tipMouseout)
        .attr("fill", function(d) { return colorScale(d.CR); })
        .attr("cx", function(d) { return projection([+d.longitude, +d.latitude])[0]; })
        .attr("cy", function(d) { return projection([+d.longitude, +d.latitude])[1]; })
        .attr("r",  0)
      .transition()
        .duration(500)
        .attr("r",  function(d) { return radiusScale(+d.TOT); });

    circles.exit() // exiting points
        .attr("r",  function(d) { return radiusScale(+d.TOT); })
      .transition()
        .duration(500)
        .attr("r", 0).remove();
};

// Creates a legend showing the mapping from crime type to color
// **nb: the domain of colorScale should include all crime types when this is called
function makeLegend() {
    var margin = { top: 50, left: -40 },
        legendWidth  = 250,
        legendHeight = 150;

    var legend = mapSvg.append('g')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var legends = legend.selectAll(".legend")
        .data(colorScale.domain())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    // draw legend colored rectangles
    legends.append("rect")
        .attr("x", legendWidth - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", colorScale);

    // draw legend text
    legends.append("text")
        .attr("x", legendWidth - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d.toLowerCase(); });
};