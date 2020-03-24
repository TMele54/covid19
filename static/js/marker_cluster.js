"use strict";
var geojson, metadata;
var map_legend = '#map_legend';
var geojsonPath = '../static/data/geoJSONPie.json';
var categoryField = '5074';
var iconField = '5065';
var popupFields = ['5065','5055','5074'];
var tileServer = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var tileAttribution = 'Map data: <a href="http://openstreetmap.org">OSM</a>';
var rmax = 30; //Maximum radius for cluster pies
var markerclusters = L.markerClusterGroup({
      maxClusterRadius: 2*rmax,
      iconCreateFunction: defineClusterIcon //this is where the magic happens
    });
var initBounds = [38.8,0];
var initZoom = 3;

var map = L.map('map').setView(initBounds, initZoom);

//Add basemap
L.tileLayer(tileServer, {attribution: tileAttribution,  maxZoom: 15}).addTo(map);

//and the empty markercluster layer
map.addLayer(markerclusters);

function defineFeature(feature, latlng) {
    var categoryVal = feature.properties[categoryField];
    var iconVal = feature.properties[iconField];
    var myClass = 'marker category-'+categoryVal+' icon-'+iconVal;
    var myIcon = L.divIcon({
        className: myClass,
        iconSize:null
    });

    return L.marker(latlng, {icon: myIcon});
}
function defineFeaturePopup(feature, layer) {

    var props = feature.properties;
    var fields = metadata.fields;
    var popupContent = '';

    popupFields.map( function(key) {
        if (props[key]) {
            var val = props[key];
            var label = fields[key].name;
        if (fields[key].lookup) {
            val = fields[key].lookup[val];
        }
            popupContent += '<span class="attribute"><span class="label">'+label+':</span> '+val+'</span>';
        }
});
    popupContent = '<div class="map-popup">'+popupContent+'</div>';
    layer.bindPopup(popupContent,{offset: L.point(1,-2)});
}
function defineClusterIcon(cluster) {

    var children = cluster.getAllChildMarkers();
    var n = children.length;
    var strokeWidth = 1;
    var r = rmax-2*strokeWidth-(n<10?12:n<100?8:n<1000?4:0);
    var iconDim = (r+strokeWidth)*2;
    var data = d3.nest().key(function(d) { return d.feature.properties[categoryField]; })
                    .entries(children, d3.map);

    var html = bakeThePie({data: data,
                        valueFunc: function(d){return d.values.length;},
                        strokeWidth: 1,
                        outerRadius: r,
                        innerRadius: r-10,
                        pieClass: 'cluster-pie',
                        pieLabel: n,
                        pieLabelClass: 'marker-cluster-pie-label',
                        pathClassFunc: function(d){return "category-"+d.data.key;},
                        pathTitleFunc: function(d){return metadata.fields[categoryField].lookup[d.data.key]+' ('+d.data.values.length+' accident'+(d.data.values.length!=1?'s':'')+')';}
                      });


    var myIcon = new L.DivIcon({ html: html, className: 'marker-cluster',
        iconSize: new L.Point(iconDim, iconDim)
    });

    return myIcon;
}
function bakeThePie(options) {

    if (!options.data || !options.valueFunc) {
        return '';
    }
    
    var data = options.data;
    var valueFunc = options.valueFunc;
    var r = options.outerRadius?options.outerRadius:28;
    var rInner = options.innerRadius?options.innerRadius:r-10;
    var strokeWidth = options.strokeWidth?options.strokeWidth:1;
    var pathClassFunc = options.pathClassFunc?options.pathClassFunc:function(){return '';};
    var pathTitleFunc = options.pathTitleFunc?options.pathTitleFunc:function(){return '';};
    var pieClass = options.pieClass?options.pieClass:'marker-cluster-pie';
    var pieLabel = options.pieLabel?options.pieLabel:d3.sum(data,valueFunc);
    var pieLabelClass = options.pieLabelClass?options.pieLabelClass:'marker-cluster-pie-label';
    var origo = (r+strokeWidth);
    var w = origo*2;
    var h = w;
    var donut = d3.layout.pie();
    var arc = d3.svg.arc().innerRadius(rInner).outerRadius(r);
    

    //Create an svg element
    var svg = document.createElementNS(d3.ns.prefix.svg, 'svg');

    //Create the pie chart
    var vis = d3.select(svg)
        .data([data])
        .attr('class', pieClass)
        .attr('width', w)
        .attr('height', h);

    var arcs = vis.selectAll('g.arc')
        .data(donut.value(valueFunc))
        .enter().append('svg:g')
        .attr('class', 'arc')
        .attr('transform', 'translate(' + origo + ',' + origo + ')');

    arcs.append('svg:path')
        .attr('class', pathClassFunc)
        .attr('stroke-width', strokeWidth)
        .attr('d', arc)
        .append('svg:title')
        .text(pathTitleFunc);

    vis.append('text')
        .attr('x',origo)
        .attr('y',origo)
        .attr('class', pieLabelClass)
        .attr('text-anchor', 'middle')
        .attr('dy','.3em')
        .text(pieLabel);

    return serializeXmlNode(svg);
}
function renderLegend() {
    var data = d3.entries(metadata.fields[categoryField].lookup),
        legenddiv = d3.select(map_legend).append('div').attr('id','legend');

    var heading = legenddiv.append('div')
                            .classed('legendheading', true)
                            .text(metadata.fields[categoryField].name);

    var legenditems = legenddiv.selectAll('.legenditem').data(data);

    legenditems
        .enter()
        .append('div')
        .attr('class',function(d){return 'category-'+d.key;})
        .classed({'legenditem': true})
        .text(function(d){return d.value;});
}
function serializeXmlNode(xmlNode) {
    if (typeof window.XMLSerializer != "undefined") {
        return (new window.XMLSerializer()).serializeToString(xmlNode);
    } else if (typeof xmlNode.xml != "undefined") {
        return xmlNode.xml;
    }
    return "";
}
function call_data(){

    $.ajax({
        type: "POST",
        url: '/get_data',
        contentType: 'application/json;charset=UTF-8',
        success: function(data) {
            console.log("success")
            console.log("SUCCESSFUL DATA:",data)
            draw_map(data)
        }
    });
}
function draw_map(data){
    //d3.json(geojsonPath, function(error, data) {
    //geojson = data;
    metadata = data.properties;

    var markers = L.geoJson(data, {
        pointToLayer: defineFeature,
        onEachFeature: defineFeaturePopup
    });

    markerclusters.addLayer(markers);

    //map.fitBounds(markers.getBounds());
    map.attributionControl.addAttribution(metadata.attribution);
    renderLegend();
};
call_data()