from flask import Flask, render_template

app = Flask(__name__)


@app.route('/covid_19')
def covid_19():
    return render_template('covid_19.html')

if __name__ == '__main__':
    app.run(debug=True)
