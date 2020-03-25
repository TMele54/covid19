from flask import Flask, render_template, jsonify, request
from modules.dataworld import dw
import collections
import json
import pprint
ppr = pprint.PrettyPrinter(indent=4)
app = Flask(__name__)


@app.route('/get_data', methods=['GET', 'POST'])
def get_data():
    if request.method == "POST":
        V = request.form["data"]
        V = int(V)
        print("INPUT FROM JS:",V)

    if V == 0:
        Q = '''
            SELECT country_region, province_state, location, lat, long, case_type, date, cases 
            from covid_19_cases 
            where date='2020-03-23' and province_state not like '%princess%'
            GROUP BY location, date, case_type  
            ORDER BY country_region ASC, province_state DESC, date DESC  
            LIMIT 1000
        '''

        db_path = "covid-19-data-resource-hub/covid-19-case-counts"

        results = []
        query_results = dw.query(db_path, Q)
        _features = {"type": "FeatureCollection", "features": []}
        _properties = {"properties": {
            "fields": {
                "5065": {
                    "lookup": {
                        "1": "Confirmed",
                        "2": "Death"
                    },
                    "name":
                        "Accident type"
                }, "5055": {
                    "name": "Updated"
                },
                "5074": {
                    "lookup": {
                        "1": "Confirmed",
                        "2": "Deaths"
                    },
                    "name": "Cases"
                }}, "attribution":
                "CoViD: ",
            "description": "Global Cases"}}

        for i in range(0, len(query_results.table)):

            record = {}
            od = query_results.table[i]

            for key, value in od.items():
                record[key] = str(value)

            if record["case_type"] == "Confirmed":
                record["case_type_value"] = "1"
            else:
                record["case_type_value"] = "2"

            _geometry = {
                "geometry": {
                    "type": "Point",
                    "coordinates": [record["long"], record["lat"]]
                },
                "type": "Feature",
                "properties": {}
            }

            _geometry["properties"] = {
                "5065": record["case_type_value"],
                "5055": record["date"],
                "5074": record["case_type_value"],
                "cases": record["cases"]
            }
            _features["features"].append(_geometry)

            results.append(record)

        _features["properties"] = _properties["properties"]

        # Enumerate for marker cluster
        feats_temp = []
        for feature in _features["features"]:
            number_of_instances = int(feature["properties"]["cases"])
            for j in range(0, number_of_instances):
                feats_temp.append(feature)

        _features["features"] = feats_temp

        return jsonify(_features)
    elif V == 1:
        Q = '''
                select country_region,  max(cases) as Confirmed
                from covid_19_cases
                where case_type="Confirmed"
                GROUP BY country_region
                order by Confirmed DESC 
                limit 5  
            '''

        db_path = "covid-19-data-resource-hub/covid-19-case-counts"

        results = []
        query_results = dw.query(db_path, Q)

        for i in range(0, len(query_results.table)):

            record = {}
            od = query_results.table[i]

            for key, value in od.items():
                record[key] = str(value)
            results.append(record)

        return jsonify(results)
    else:
        Q = ''''''
        return "ERROR..."



@app.route('/covid19')
def covid19():
    return render_template('covid_19.html')



if __name__ == '__main__':
    app.run(debug=True)

'''

Q = 
    
            SELECT country_region, province_state, location, lat, long, case_type, date, cases
            from covid_19_cases
            where cases !=0 and date = "2020-03-22" and province_state not like "%princess%" 
            GROUP BY location, date, case_type
            ORDER BY country_region desc, province_state DESC, date DESC 
            LIMIT 1000
            
fields = 'date, country_region, province_state, case_type, cases, difference, prep_flow_runtime, latest_date, lat, long'
    order_key = 'latest_date'
    table = 'covid_19_cases'
    count = 1000

    # if request.method == "POST":
    #    _data = request.json['data']
    #    query_details = json.loads(_data)
    #    print("JOJO" * 1000)
    #    print(query_details)
    # print(query_details)
    # print("JOJO"*1000)
    ##db_path = query_details[0]
    #fields = query_details[1]
    #table = query_details[2]
    #order_key = query_details[3]
    #count = query_details[4]
    #Q = 'select * from "covid_19_cases" limit 100'

'''