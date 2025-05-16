// pdfExportTopic.ts
// Utility to export a prediction topic card as a branded PDF using jsPDF and html2canvas
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportTopicToPDF({
  cardId,
  topicTitle,
  fullName,
  dob,
  editedBy,
  iconUrl,
  timestamp,
  logoUrl,
}: {
  cardId: string;
  topicTitle: string;
  fullName: string;
  dob: string | undefined;
  editedBy?: string;
  iconUrl?: string;
  timestamp?: string;
  logoUrl?: string;
}) {
  const card = document.getElementById(cardId);
  if (!card) {
    alert('Could not find topic card to export.');
    return;
  }
  // Use html2canvas to get a high-res image of the card
  const canvas = await html2canvas(card, { scale: 2, backgroundColor: '#f8fafc' });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  // Optionally add logo or icon
  let y = 32;
  if (logoUrl) {
    pdf.addImage(logoUrl, 'PNG', 32, y, 48, 48);
    y += 56;
  } else if (iconUrl) {
    pdf.addImage(iconUrl, 'PNG', 32, y, 32, 32);
    y += 40;
  }
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.text(topicTitle, 96, 64);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.text(`Client: ${fullName}${dob ? ` | DOB: ${dob}` : ''}`, 32, y + 32);
  if (editedBy) pdf.text(`Edited by: ${editedBy}`, 32, y + 54);
  if (timestamp) pdf.text(`Generated: ${timestamp}`, 32, y + 76);
  // Add the card image
  pdf.addImage(imgData, 'PNG', 32, y + 90, 480, 0, undefined, 'FAST');
  // Save
  const safeTitle = topicTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const safeName = fullName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const fileName = `prediction_${safeTitle}_${safeName}${dob ? `_${dob}` : ''}.pdf`;
  pdf.save(fileName);
}
