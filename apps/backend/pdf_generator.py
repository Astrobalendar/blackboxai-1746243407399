from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO

def generate_prediction_pdf(prediction_data: dict) -> bytes:
    """
    Generate a styled PDF report from KP prediction data and return as bytes.
    """
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, 750, "AstroBalendar KP Prediction Report")
    c.setFont("Helvetica", 12)
    c.drawString(100, 730, f"Name: {prediction_data.get('name', '')}")
    c.drawString(100, 710, f"Birth Date: {prediction_data.get('birth_date', '')}")

    y = 690
    c.drawString(100, y, "Planetary Positions:")
    y -= 20
    for planet in prediction_data.get('planetary_positions', []):
        c.drawString(120, y, f"{planet['planet']}: Longitude {planet['longitude']}, House {planet['house']}")
        y -= 20

    c.drawString(100, y, "Prediction Summary:")
    y -= 20
    summary = prediction_data.get('prediction_summary', '')
    for line in summary.split('\n'):
        c.drawString(120, y, line)
        y -= 20

    c.save()
    pdf = buffer.getvalue()
    buffer.close()
    return pdf
