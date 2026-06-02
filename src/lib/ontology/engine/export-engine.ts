import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { THEME_COLORS } from "@/lib/system/theme";

export async function generateArtifactPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  // Create canvas from the element
  // scale: 2 for retina-like quality
  const canvas = await html2canvas(element, {
    backgroundColor: THEME_COLORS.white,
    logging: false,
    scale: 2,
    useCORS: true,
  } as any);

  const imgData = canvas.toDataURL("image/png");

  // A4 Size in mm
  const pdfWidth = 210;
  const pdfHeight = 297;

  // Calculate image aspect ratio
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  const doc = new jsPDF({
    format: "a4",
    orientation: "portrait",
    unit: "mm",
  });

  doc.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

  // If content is longer than A4, we need multiple pages.
  // For this MVP template, we assume it fits or simple cut-off is acceptable on page 1 for the "Scroll" feel.
  // But a robust implementation handles splitting.
  // Given the Template is 297mm minHeight, let's keep it simple for MVP.

  doc.save(`${filename}.pdf`);
}
