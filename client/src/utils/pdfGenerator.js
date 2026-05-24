import jsPDF from "jspdf";
import airplaneBg from "../assets/airplane-bg.jpg";

// Helper function to add text with proper line breaks
const addWrappedText = (doc, text, x, y, maxWidth) => {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * 10; // Return the new Y position
};

// Helper function to add a section title
const addSectionTitle = (doc, title, y) => {
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, 20, y);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  return y + 10;
};

// Helper function to convert chart to base64 image
const chartToImage = (chartRef) => {
  if (!chartRef?.current) return null;

  // Get the SVG element from the chart
  const svgElement = chartRef.current.container.querySelector("svg");
  if (!svgElement) return null;

  // Create a canvas element
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Set canvas dimensions to match SVG
  const svgRect = svgElement.getBoundingClientRect();
  canvas.width = svgRect.width;
  canvas.height = svgRect.height;

  // Create a Blob from the SVG
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });

  return new Promise((resolve) => {
    // Create image from SVG
    const img = new Image();
    img.onload = () => {
      // Draw image to canvas
      ctx.fillStyle = "#1a1a1a"; // Match the dark theme background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = URL.createObjectURL(svgBlob);
  });
};

// Main function to generate PDF report
export const generatePDFReport = async (data, chartRefs) => {
  const { metrics, revenueData } = data;
  const doc = new jsPDF();
  doc.setFillColor(26, 26, 26); // #1a1a1a
  doc.rect(
    0,
    0,
    doc.internal.pageSize.width,
    doc.internal.pageSize.height,
    "F"
  );

  // Add airplane background
  doc.addSvgAsImage(
    airplaneBg,
    0,
    0,
    doc.internal.pageSize.width,
    doc.internal.pageSize.height
  );
  doc.setTextColor(255, 255, 255); // White text for dark background
  let yPos = 20;

  // Add title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Aviation Operations Report", 20, yPos);
  yPos += 20;

  // Add date
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  // doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPos);

  // Add metrics section
  yPos = addSectionTitle(doc, "Key Metrics", yPos);

  // Format metrics data
  const metricsText = [
    `Total Flights: ${metrics?.totalFlights || "N/A"}`,
    `Total Revenue: $${metrics?.totalRevenue?.toLocaleString() || "N/A"}`,
    `Total Passengers: ${metrics?.totalPassengers?.toLocaleString() || "N/A"}`,
    `Average Load Factor: ${metrics?.avgLoadFactor || "N/A"}%`,
  ].join("\n");

  yPos = addWrappedText(doc, metricsText, 20, yPos, 170);

  // Add growth metrics
  const growthText = [
    `Flight Growth: ${metrics?.flightsGrowth || "N/A"}%`,
    `Revenue Growth: ${metrics?.revenueGrowth || "N/A"}%`,
    `Passenger Growth: ${metrics?.passengersGrowth || "N/A"}%`,
    `Load Factor Growth: ${metrics?.loadFactorGrowth || "N/A"}%`,
  ].join("\n");

  yPos = addWrappedText(doc, growthText, 20, yPos, 170);

  // Add charts if available
  if (chartRefs?.revenueChart) {
    yPos = addSectionTitle(doc, "Revenue Overview", yPos);
    try {
      const chartImage = await chartToImage(chartRefs.revenueChart);
      if (chartImage) {
        doc.addImage(chartImage, "PNG", 20, yPos, 170, 80);
        yPos += 90;
      }
    } catch (err) {
      console.error("Error converting chart to image:", err);
    }
  }

  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(10);
  doc.text(
    `Page ${pageCount}`,
    doc.internal.pageSize.width - 30,
    doc.internal.pageSize.height - 10
  );

  return doc;
};
