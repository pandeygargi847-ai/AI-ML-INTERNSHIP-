from database.database import initialize_database
from flask import Flask, render_template
from config import Config

app = Flask(__name__)
app.config.from_object(Config)


@app.route("/")
def home():
    return render_template("home.html")


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


@app.route("/camera")
def camera():
    return render_template("camera.html")


@app.route("/symptoms")
def symptoms():
    return render_template("symptoms.html")


@app.route("/analytics")
def analytics():
    return render_template("analytics.html")


@app.route("/reports")
def reports():
    return render_template("report.html")


@app.route("/profile")
def profile():
    return render_template("profile.html")


@app.route("/about")
def about():
    return render_template("about.html")


if __name__ == "__main__":
    initialize_database()
    app.run(debug=True)
    app.run(debug=True)