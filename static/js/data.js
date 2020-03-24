function call_data(path, fields, table, where, order_by, group_by,  limit, Q, which){
    if(which === "SQL"){
        query = Q
    }
    else if(which === "piece_wise"){
        
        QString = 'SELECT ' + fields + ' FROM ' + table + ' WHERE ' + where + ' GROUP BY ' +
        group_by + ' ORDER BY ' + order_by + '  LIMIT ' + limit;
        query = [path, QString]
    }
    else{
        $.ajax({
            type: 'POST',
            url: '/get_data',
            contentType: 'application/json;charset=UTF-8',
            success: function(data) {
                console.log(JSON.stringify(data));
            }
        });
    }


}

var _path = 'covid-19-data-resource-hub/covid-19-case-counts';
var _fields =  'date, country_region, province_state, case_type, cases, difference, prep_flow_runtime, latest_date, lat, long';
var _table = 'covid_19_cases';
var _where = '';
var _group_by = 'latest_date';
var _order_by = 'latest_date';
var _limit = 1000;
Q = "";


call_data(
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
    "LIMIT 1000",
    "SQL"
);