function horizontal_bar(data){

    var margin = {
        top: 20,
        right: 20,
        bottom: 35,
        left: 100
    },
        width = 700 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;


    var y = d3.scale.ordinal().rangeRoundBands([0, height], .1);
    var x = d3.scale.linear().range([0, width]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5)// "%");
    var yAxis = d3.svg.axis().scale(y).orient("left");

    var color = d3.scale.category20c();
    var color = d3.scale.linear().range(["red", "orange"]).domain([0, 4]);

    var svg = d3.select("#country_hbars").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain([0, d3.max(data, function(d) { return d.Confirmed;  })]);
    y.domain(data.map(function(d) { return d.country_region; }));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("transform", "rotate(0)")
        .attr("y", 6)
        .attr("dy", "1.91em")
        .style("text-anchor", "start")
        .text("Number of Cases");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    var bars = svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar");

    bars.attr("y", function(d) { return y(d.country_region); })
        .attr("height", y.rangeBand())
        .attr("x", 0)
        .attr("width", function(d) {return x(d.Confirmed);})
        .attr("fill", function(d, i) {return color(i);})
        .attr("id", function(d, i) {return i;})
        .on("mouseover", function() { d3.select(this).attr("fill", "green");})
        .on("mouseout", function(d, i) {d3.select(this).attr("fill", function() {return "" + color(this.id) + "";});});

    bars.append("title").text(function(d) {return d.country_region;})
        .attr("fill", "black");

    function type(d) {d.Confirmed = +d.Confirmed;return d;}
}
function call_data_q(Q) {
    $.ajax({
        type: "POST",
        url: "/get_data",
        data: {"data": Q},
        success: function (_data) {
            console.log(_data)
            horizontal_bar(_data)
        }
    })
}

call_data_q(1);




/*
var _path = 'covid-19-data-resource-hub/covid-19-case-counts';
var _fields =  'date, country_region, province_state, case_type, cases, difference, prep_flow_runtime, latest_date, lat, long';
var _table = 'covid_19_cases';
var _where = '';
var _group_by = 'latest_date';
var _order_by = 'latest_date';
var _limit = 1000;
_Q = "select country_region,  max(cases) as Confirmed\n" +
    "from covid_19_cases\n" +
    "where case_type=\"Confirmed\"\n" +
    "GROUP BY country_region\n" +
    "order by Confirmed DESC";
_which="SQL";

var data = call_data(_path, _fields, _table, _where, _order_by, _group_by,  _limit, _Q, _which)
horizontal_bar(data)*/
