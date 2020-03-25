function call_data(path, fields, table, where, order_by, group_by,  limit, Q, which) {
    if (which === "SQL") {
        query = Q;
        $.ajax({
            type: 'POST',
            url: '/get_data',
            contentType: 'application/json;charset=UTF-8',
            data: {'data': query},
            success: function (_data) {
                console.log(which, "query");
                console.log(JSON.stringify(_data));
            }
        });

    }
    else if (which === "piece_wise") {

        QString = 'SELECT ' + fields + ' FROM ' + table + ' WHERE ' + where + ' GROUP BY ' +
            group_by + ' ORDER BY ' + order_by + '  LIMIT ' + limit;
        query = [path, QString]

        $.ajax({
            type: 'POST',
            url: '/get_data',
            contentType: 'application/json;charset=UTF-8',
            data: {'data': query},
            success: function (_data) {
                console.log(which, "query");
                console.log(JSON.stringify(_data));
            }
        });
    }
    else {
        $.ajax({
            type: 'POST',
            url: '/get_data',
            contentType: 'application/json;charset=UTF-8',
            success: function (data) {
                console.log(which, "query");
                console.log(JSON.stringify(_data));
            }
        })


    }
}
function call_data_q(Q) {
    $.ajax({
        type: "POST",
        url: "/get_data",
        data: {"data": Q},
        success: function (_data) {
            return _data
        }
    })

}


/*function getYesterdaysDate(days_back) {
    var date = new Date();
    date.setDate(date.getDate()-days_back);
    YEAR = date.getFullYear();
    MONTH = (date.getMonth()+1);
    DAY = date.getDate();
    if(MONTH <= 9){
        MONTH = "0"+MONTH
    }
    if(DAY <= 9){
        DAY = "0"+DAY
    }
    _DATE_ = YEAR+"-"+MONTH+"-"+DAY;
    return _DATE_
}*/

/*.done(function(data){
if(data.error){
$("#queryError").text(data.error).show();
$("#querySuccess").hide();
}
else{
$("#querySuccess").text("Success").show();
$("#queryError").hide();
}
});*/
/*var _path = 'covid-19-data-resource-hub/covid-19-case-counts';
var _fields =  'date, country_region, province_state, case_type, cases, difference, prep_flow_runtime, latest_date, lat, long';
var _table = 'covid_19_cases';
var _where = '';
var _group_by = 'latest_date';
var _order_by = 'latest_date';
var _limit = 1000;
var Q = "";


var r = (
    'covid-19-data-resource-hub/covid-19-case-counts',
    'date, country_region, province_state, case_type, cases, difference, prep_flow_runtime, latest_date, lat, long',
    'covid_19_cases',
    '',
    'latest_date',
    'latest_date',
    "1000",
    "SELECT country_region, province_state, location, lat, long, case_type, date, cases\n" +
    "from covid_19_cases\n" +
    "where cases !=0 and date = \"2020-03-22\"\n" +
    "GROUP BY location, date, case_type\n" +
    "ORDER BY country_region desc, province_state DESC, date DESC \n" +
    "LIMIT 10000",
    "SQL"
);
*/