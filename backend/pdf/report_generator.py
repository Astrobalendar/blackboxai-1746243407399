from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from datetime import datetime
from typing import Dict
import os

def generate_prediction_pdf(prediction: Dict, user_data: Dict, output_path: str) -> None:
    """
    Generate a PDF report for astrology prediction using ReportLab.
    :param prediction: Dictionary containing prediction results.
    :param user_data: Dictionary containing user input (e.g., name, birth details).
    :param output_path: Path to save the generated PDF.
    """
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4
    y = height - 50

    c.setFont("Helvetica-Bold", 20)
    c.drawString(50, y, "AstroBalendar Prediction Report")
    y -= 40

    c.setFont("Helvetica", 12)
    c.drawString(50, y, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    y -= 30

    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "User Details:")
    y -= 20
    c.setFont("Helvetica", 12)
    for key, value in user_data.items():
        c.drawString(60, y, f"{key}: {value}")
        y -= 18
    y -= 12

    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Prediction:")
    y -= 20
    c.setFont("Helvetica", 12)
    for key, value in prediction.items():
        c.drawString(60, y, f"{key}: {value}")
        y -= 18

    c.save()

# Example usage (remove or comment out in production):
# generate_prediction_pdf({"result": "You will have a great year!"}, {"Name": "Alice", "DOB": "2000-01-01"}, "sample_report.pdf")
