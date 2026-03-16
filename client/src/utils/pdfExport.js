import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportResumePDF(resumeText, title = "ATS_Analysis_Report") {
  // We want to capture the ResultsPanel. We'll find it by ID.
  const element = document.getElementById("results-panel-export");
  
  if (!element) {
    alert("Please wait for analysis to complete before exporting the report.");
    return;
  }

  try {
    // Add a temporary class/style to ensure the capture looks good (no dark mode issues with canvas)
    const originalBackground = element.style.background;
    const originalColor = element.style.color;
    // We can also temporarily hide buttons before capture if we wanted to
    
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true,
      backgroundColor: "#0f172a", // Match dark theme background
    });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    
    // Create PDF (A4 size)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Scale image to fit PDF width
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Handle multipage if ResultsPanel is very long
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight; // Shift position up by one page
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`${title.replace(/\s+/g, "_")}.pdf`);
  } catch (err) {
    console.error("Failed to generate PDF:", err);
    alert("Failed to generate PDF. Check console for details.");
  }
}
