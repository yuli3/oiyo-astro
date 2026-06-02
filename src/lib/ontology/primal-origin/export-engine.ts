import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Generate Artifact PDF
 * Captures a DOM element by ID and converts it to a high-quality PDF.
 *
 * @param elementId - The DOM ID of the element to capture (e.g., 'resonance-artifact-target')
 * @param filename - The desired filename for the downloaded PDF (without extension)
 */
export async function generateArtifactPDF(
  elementId: string,
  filename: string = "oiyo-artifact",
): Promise<void> {
  const element = document.getElementById(elementId);

  if (!element) {
    console.error(`Artifact element with ID '${elementId}' not found.`);
    throw new Error("Artifact target not found");
  }

  try {
    // 1. High-fidelity canvas capture
    const canvas = await html2canvas(element, {
      background: "#f6fff8", // Ensuring background color matches design
      logging: false,
      scale: 2, // 2x scale for Retina-like sharpness
      useCORS: true, // Allow cross-origin images (e.g., external CDN assets)
    } as any);

    const imgData = canvas.toDataURL("image/png");

    // 2. Calculate dimensions for A4 or fluid layout
    // Standard A4 is 210mm x 297mm
    const pdf = new jsPDF({
      format: "a4",
      orientation: "portrait",
      unit: "mm",
    });

    const imgWidth = 210; // Full A4 width
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const heightLeft = imgHeight;
    const position = 0;

    // 3. Add image to PDF (handling possible multipage logic if element is super long)
    // For artifacts, we usually aim for a single page poster-style, but let's be robust

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

    // If we want multipage support for long scrolls:
    /*
    heightLeft -= pageHeight;
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    */

    // 4. Save
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("PDF Generation Failed:", error);
    throw error;
  }
}
