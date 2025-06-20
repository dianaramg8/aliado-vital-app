from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return "Hola, este es el backend de Aliado Vital App."

if __name__ == '__main__':
    app.run(debug=True)
