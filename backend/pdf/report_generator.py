from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from datetime import datetime
import uuid

styles = getSampleStyleSheet()
header_style = ParagraphStyle('Header', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=14, spaceAfter=12)
section_title_style = ParagraphStyle('SectionTitle', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=12, spaceAfter=8)
body_style = ParagraphStyle('Body', parent=styles['Normal'], fontName='Helvetica', fontSize=10, spaceAfter=6)


def draw_header(prediction):
    fields = [
        ('Name', prediction.get('name', '')),
        ('Gender', prediction.get('gender', '')),
        ('Date of Birth', prediction.get('dob', '')),
        ('Time of Birth', prediction.get('tob', '')),
        ('Place of Birth', prediction.get('place', '')),
        ('Star', prediction.get('star', '')),
        ('Ayanamsa', prediction.get('ayanamsa', '')),
        ('Dasa Balance', prediction.get('dasa_balance', '')),
        ('Time Zone', prediction.get('timezone', '')),
        ('Local Time', prediction.get('local_time', '')),
        ('Standard Time', prediction.get('standard_time', '')),
        ('Sunrise', prediction.get('sunrise', '')),
        ('Sunset', prediction.get('sunset', '')),
    ]
    elements = [Paragraph('AstroBalendar Prediction Report', header_style), Spacer(1, 0.1*inch)]
    for label, value in fields:
        if value:
            elements.append(Paragraph(f'<b>{label}:</b> {value}', body_style))
    elements.append(Spacer(1, 0.2*inch))
    return elements


def draw_ruling_planets(prediction):
    table_data = [[
        'Lagna', 'Sun', 'Moon', 'Star', 'SubLord', 'SubSubLord'
    ]]
    ruling = prediction.get('ruling_planets', [])
    for row in ruling:
        table_data.append([
            row.get('lagna', ''), row.get('sun', ''), row.get('moon', ''),
            row.get('star', ''), row.get('sublord', ''), row.get('sub_sublord', '')
        ])
    t = Table(table_data, hAlign='LEFT', style=[
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
    ])
    return [Paragraph('Ruling Planets', section_title_style), Spacer(1, 0.05*inch), t, Spacer(1, 0.2*inch)]


def draw_planetary_table(prediction):
    table_data = [[
        'Planet', 'Longitude', 'Star', 'Star Lord', 'Sub Lord'
    ]]
    planets = prediction.get('planetary_table', [])
    for row in planets:
        table_data.append([
            row.get('planet', ''), row.get('longitude', ''), row.get('star', ''),
            row.get('star_lord', ''), row.get('sub_lord', '')
        ])
    t = Table(table_data, hAlign='LEFT', style=[
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
    ])
    return [Paragraph('Planetary Table', section_title_style), Spacer(1, 0.05*inch), t, Spacer(1, 0.2*inch)]


def draw_bhava_cuspal_chart(prediction):
    table_data = [[
        'House #', 'Ruling Sign', 'Cuspal Degrees'
    ]]
    bhavas = prediction.get('bhava_cuspal_chart', [])
    for row in bhavas:
        table_data.append([
            row.get('house', ''), row.get('ruling_sign', ''), row.get('cuspal_degrees', '')
        ])
    t = Table(table_data, hAlign='LEFT', style=[
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
    ])
    return [Paragraph('Bhava Cuspal Chart', section_title_style), Spacer(1, 0.05*inch), t, Spacer(1, 0.2*inch)]


def draw_dasa_bukthi_summary(prediction):
    table_data = [[
        'Dasa', 'Bukthi', 'SubBukthi', 'Start Date', 'End Date', 'Balance'
    ]]
    dasas = prediction.get('dasa_bukthi_summary', [])
    for row in dasas:
        table_data.append([
            row.get('dasa', ''), row.get('bukthi', ''), row.get('sub_bukthi', ''),
            row.get('start_date', ''), row.get('end_date', ''), row.get('balance', '')
        ])
    t = Table(table_data, hAlign='LEFT', style=[
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
    ])
    return [Paragraph('Dasa Bukthi Summary', section_title_style), Spacer(1, 0.05*inch), t, Spacer(1, 0.2*inch)]


def draw_footer(canvas, doc):
    canvas.saveState()
    footer_text = f"Ref No: {getattr(doc, 'ref_no', '')} | Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')} | Page {doc.page}"
    canvas.setFont('Helvetica', 8)
    canvas.drawString(40, 20, footer_text)
    canvas.restoreState()


def generate_prediction_pdf(prediction: dict, output_path: str) -> None:
    """
    Generate a KP-style astrology PDF report.
    :param prediction: Dictionary (PredictionResult) with all sections.
    :param output_path: Path to save the generated PDF.
    """
    doc = SimpleDocTemplate(output_path, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=60, bottomMargin=40)
    doc.ref_no = str(uuid.uuid4())[:8]
    elements = []

    # Header Section
    elements += draw_header(prediction)
    elements.append(PageBreak())

    # Ruling Planets
    elements += draw_ruling_planets(prediction)
    elements.append(PageBreak())

    # Planetary Table
    elements += draw_planetary_table(prediction)
    elements.append(PageBreak())

    # Bhava Cuspal Chart
    elements += draw_bhava_cuspal_chart(prediction)
    elements.append(PageBreak())

    # Dasa Bukthi Summary
    elements += draw_dasa_bukthi_summary(prediction)

    doc.build(elements, onFirstPage=draw_footer, onLaterPages=draw_footer)
