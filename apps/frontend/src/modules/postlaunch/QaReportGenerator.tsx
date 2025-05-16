import jsPDF from 'jspdf';

export function generateQaReport({ fullName, timestamp }: { fullName: string; timestamp: string }) {
  const doc = new jsPDF();
  let y = 15;
  doc.setFontSize(18);
  doc.text('Horoscope Test Flow — QA Completion Report', 10, y);
  y += 10;
  doc.setFontSize(12);
  doc.text('System Modules:', 10, y); y += 8;
  doc.setFontSize(10);
  doc.text('- Prediction View, Test Sessions, PDF Export, AI Chart Insight', 12, y); y += 6;
  doc.text('- Admin/Client Role Matrix, Firestore, Batch Tools', 12, y); y += 10;

  doc.setFontSize(12);
  doc.text('Firestore Schema:', 10, y); y += 8;
  doc.setFontSize(10);
  doc.text('/users/{uid}, /horoscopes, /predictions, /tests, /batches', 12, y); y += 10;

  doc.setFontSize(12);
  doc.text('Role Matrix:', 10, y); y += 8;
  doc.setFontSize(10);
  doc.text('Astrologer: Full access, Client: View-only, Admin: All modules', 12, y); y += 10;

  doc.setFontSize(12);
  doc.text('Prediction Flow Validation:', 10, y); y += 8;
  doc.setFontSize(10);
  doc.text('- Chart → Prediction → Insight → Export', 12, y); y += 10;

  doc.setFontSize(12);
  doc.text('PDF Export:', 10, y); y += 8;
  doc.setFontSize(10);
  doc.text('- PDF includes chart, predictions, insights, signature', 12, y); y += 10;

  doc.setFontSize(12);
  doc.text('AI Insight Accuracy:', 10, y); y += 8;
  doc.setFontSize(10);
  doc.text('- Validated via /api/chart-insight, role-aware', 12, y); y += 10;

  doc.setFontSize(12);
  doc.text('Timestamp & Attribution:', 10, y); y += 8;
  doc.setFontSize(10);
  doc.text(`QA Completion: ${timestamp}`, 12, y); y += 6;
  doc.text(`Prepared by: Astrologer ${fullName} / Dev Team`, 12, y);
  return doc;
}
