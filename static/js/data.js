/*
function call_data(db_path, fields, table, order_key, count){
    var info_to_flask = JSON.stringify({"data": [db_path,fields,table,order_key,count]});

    $.ajax({
        type: "POST",
        url: '{{url_for("get_data")}}',
        data: info_to_flask,
        dataType: "json",
        success: function(data) {
            alert("Success");
            console.log(JSON.stringify(data));
            alert("More Success");
        },
    });

}

var path = "covid-19-data-resource-hub/covid-19-case-counts";
var fields =  'date, country_region, province_state, case_type, cases, ' +
              'difference, prep_flow_runtime, latest_date, lat, long';
var order_by = 'covid_19_cases';
var table = 'covid_19_cases';
var size = 1000;

call_data(path, fields, table, order_by, size);
*/

function call_data(){
    $.ajax({
        type: "POST",
        url: '/get_data',
        contentType: 'application/json;charset=UTF-8',
        success: function(data) {
            console.log(JSON.stringify(data));
        }
    });
}

var path = "covid-19-data-resource-hub/covid-19-case-counts";
var fields =  'date, country_region, province_state, case_type, cases, ' +
  'difference, prep_flow_runtime, latest_date, lat, long';
var order_by = 'latest_date';
var table = 'covid_19_cases';
var size = 1000;

call_data();