from flask import Flask, render_template, jsonify
from modules.dataworld import dw
import collections
import json

app = Flask(__name__)

@app.route('/get_data', methods=['GET'])
def get_data():
    pth = "covid-19-data-resource-hub/covid-19-case-counts"
    tbl = 'covid_19_cases'
    results = []
    query_results = dw.query(pth, 'SELECT * FROM ' + tbl + ' LIMIT 1000')

    for i in range(0, len(query_results.table)):

        record = {}
        od = query_results.table[i]

        for key, value in od.items():
            record[key] = value

        results.append(record)

    return results

@app.route('/covid_19')
def covid_19():
    covidData = [
        {"tony", "builds"},
        {"tony", "kills"}
    ]
    # get_data()
    return render_template('covid_19.html', data=json.dumps(covidData))

if __name__ == '__main__':
    app.run(debug=True)
