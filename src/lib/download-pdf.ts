// @ts-expect-error - html2pdf.js has no bundled types
import html2pdf from "html2pdf.js";

export function downloadElementAsPdf(selector: string, filename: string) {
  const el = document.querySelector(selector) as HTMLElement | null;
  if (!el) return;
  return html2pdf()
    .set({
      margin: [10, 10, 10, 10],
      filename: filename.endsWith(".pdf") ? filename : `${filename}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] },
    })
    .from(el)
    .save();
}
