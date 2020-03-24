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

    Q = '''SELECT * FROM covid_19_cases ORDER BY latest_date ASC LIMIT 5000'''
    Q = '''
    SELECT *
    FROM covid_19_cases
    WHERE country_region = "US" and province_state = "New York"
    ORDER BY date DESC
    LIMIT 5000
    '''

    results = []
    query_results = dw.query(db_path, Q)

    _features = {"type": "FeatureCollection", "features": []}
    _properties = {"properties": {
                "fields": {
                        "5065": {
                            "lookup": {
                                "1": "Pedestrian",
                                "3": "Motorcycle",
                                "2": "Bicycle",
                                "4": "Car"
                            },
                            "name":
                                "Accident type"
                        }, "5055": {
                        "name": "Date"
                    },
                    "5074": {
                        "lookup": {
                            "1": "Number of Death",
                            "3": "Number of Recovered",
                            "2": "Very serious injuries",
                            "5": "No injuries",
                            "4": "Minor injuries",
                            "6": "Not recorded"
                        },
                        "name": "Injuries"
                    }}, "attribution":
            "Traffic accidents: <a href=\"http://data.norge.no/data/nasjonal-vegdatabank-api\" target=\"blank\">NVDB</a>",
                "description": "Traffic accidents in 2013 in Oslo, Norway"}}

    for i in range(0, len(query_results.table)):

        record = {}
        od = query_results.table[i]

        for key, value in od.items():
            record[key] = str(value)

        _geometry = {"geometry": {
                                    "type": "Point",
                                    "coordinates": [float(record["long"]),float(record["lat"])]},
                                    "type": "Feature",
                                    "properties": { }
                    }
        _geometry["properties"] = {"5065": str(randint(0,10)), "5055": "2013-12-"+str(randint(1,30)), "5074": str(randint(0,10))}
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