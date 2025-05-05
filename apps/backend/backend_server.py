from flask import Flask, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()  # Must be called BEFORE any imports that use env vars

from flask import Flask, jsonify
from db.mongo import db  # now safe to import after env vars loaded

app = Flask(__name__)

@app.route("/")
def home():
    return jsonify({"message": "✅ Backend connected to MongoDB!"})

@app.route("/ping")
def ping():
    try:
        db.command("ping")
        return jsonify({"status": "✅ MongoDB is alive!"})
    except Exception as e:
        return jsonify({"status": "❌ MongoDB ping failed", "error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
