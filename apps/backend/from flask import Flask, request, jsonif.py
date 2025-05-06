from flask import Flask, request, jsonify

app = Flask(__name__)  # Define the app variable

@app.route("/")
def home():
    return "Welcome to AstroBalendar Backend!"
