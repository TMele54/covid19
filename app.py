from flask import Flask, render_template, jsonify
from modules.dataworld import dw
import collections
import json

app = Flask(__name__)

@app.route('/get_data', methods=['GET'])
def get_data(pth, tbl, count):
    results = []
    query_results = dw.query(pth, 'SELECT * FROM ' + tbl + ' LIMIT ' + str(count))

    for i in range(0, len(query_results.table)):

        record = {}
        od = query_results.table[i]

        for key, value in od.items():
            record[key] = value

        results.append(record)

    return results

@app.route('/covid19')
def covid19():
    '''
    path = "covid-19-data-resource-hub/covid-19-case-counts"
    table = 'covid_19_cases'
    size = 1000

    covid_cases = get_data(path, table, size)
    covid_cases = jsonify(covid_cases)
    print(covid_cases)
    return render_template('covid_19.html', data = covid_cases)
    '''
    return render_template('covid_19.html')


if __name__ == '__main__':
    app.run(debug=True)
