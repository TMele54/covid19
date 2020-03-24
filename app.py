from flask import Flask, render_template, jsonify, request

from modules.dataworld import dw
import collections
import json
import pprint
ppr = pprint.PrettyPrinter(indent=4)
from random import randint
app = Flask(__name__)


@app.route('/get_data', methods=['GET', 'POST'])
def get_data():

    db_path = "covid-19-data-resource-hub/covid-19-case-counts"

    # Q = '''SELECT * FROM covid_19_cases ORDER BY latest_date ASC LIMIT 5000'''

    Q = '''
    
            SELECT country_region, province_state, location, lat, long, case_type, date, cases
            from covid_19_cases
            where cases !=0 and date = "2020-03-22"
            GROUP BY location, date, case_type
            ORDER BY country_region desc, province_state DESC, date DESC 
            LIMIT 1000
    
    '''

    results = []
    query_results = dw.query(db_path, Q)

    _features = {"type": "FeatureCollection", "features": []}
    _properties = {"properties": {
                "fields": {
                        "5065": {
                            "lookup": {
                                "1": "Confirmed",
                                "3": "Active",
                                "2": "Recovered",
                                "4": "Death"
                            },
                            "name":
                                "Accident type"
                        }, "5055": {
                        "name": "Date"
                    },
                    "5074": {
                        "lookup": {
                            "1": "Confirmed Cases",
                            "2": "Active Cases",
                            "3": "Recovered Cases",
                            "4": "Losses"
                        },
                        "name": "Cases"
                    }}, "attribution":
            "Traffic accidents: ",
                "description": ""}}

    for i in range(0, len(query_results.table)):

        record = {}
        od = query_results.table[i]

        for key, value in od.items():
            record[key] = str(value)

        _geometry = {"geometry": {
                                    "type": "Point",
                                    "coordinates": [float(record["long"]),float(record["lat"])]},"type": "Feature","properties": { }}
        _geometry["properties"] = {"5065": record["cases"], "5055": record["date"], "5074": record["cases"]}
        _features["features"].append(_geometry)

        results.append(record)

    _features["properties"] = _properties["properties"]

    return jsonify(_features)


@app.route('/covid19')
def covid19():

    return render_template('covid_19.html')



if __name__ == '__main__':
    app.run(debug=True)

'''
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