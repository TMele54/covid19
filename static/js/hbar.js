function horizontal_bar(data){

    var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
    },
        width = 400 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;


    var y = d3.scale.ordinal()
        .rangeRoundBands([0, height], .1);

    var x = d3.scale.linear()
        .range([0, width]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(10, "%");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var color = d3.scale.category20c();

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.tsv("data.tsv", type, function(error, data) {
        x.domain([0, d3.max(data, function(d) {
            return d.frequency;
        })]);
        y.domain(data.map(function(d) {
            return d.letter;
        }));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("transform", "rotate(0)")
            .attr("y", 6)
            .attr("dy", "1.91em")
            .style("text-anchor", "start")
            .text("Frequency");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        var bars = svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar");

        bars.attr("y", function(d) {
            return y(d.letter);
        })
            .attr("height", y.rangeBand())
            .attr("x", 0)//function(d) {
                //return x(d.frequency);
            //})
            .attr("width", function(d) {
                return x(d.frequency);
            })
            .attr("fill", function(d, i) {
                return color(i);
            })
            .attr("id", function(d, i) {
                return i;
            })
            .on("mouseover", function() {
                d3.select(this)
                    .attr("fill", "red");
            })
            .on("mouseout", function(d, i) {
                d3.select(this).attr("fill", function() {
                    return "" + color(this.id) + "";
                });
            });

        bars.append("title")
            .text(function(d) {
                return d.letter;
            });

    });

    function type(d) {
        d.frequency = +d.Confirmed;
        return d;
    }
}


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
_which="SQL"

var data = call_data(_path, _fields, _table, _where, _order_by, _group_by,  _limit, _Q, _which)
horizontal_bar(data)