import { fileSystem as fileService } from "../../infrastructure/NeutralinoFileSystem.js";
import { logger } from "../../infrastructure/Logger.js";
import toast from "react-hot-toast";

export const exportService = {
  exportToHTML: async (htmlContent) => {
    try {
      const savePath = await window.Neutralino.os.showSaveDialog(
        "Export as HTML",
        {
          defaultPath: "export.html",
        },
      );
      if (savePath) {
        const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Export</title><style>body { font-family: system-ui; padding: 2rem; max-width: 800px; margin: 0 auto; }</style></head><body>${htmlContent}</body></html>`;
        await fileService.writeFile(savePath, fullHtml);
        toast.success("HTML Exported Successfully!");
      }
    } catch (e) {
      toast.error("Export failed.");
      logger.error("HTML export error", e);
    }
  },

  exportToPDF: async () => {
    try {
      const savePath = await window.Neutralino.os.showSaveDialog(
        "Export as PDF",
        {
          defaultPath: "export.pdf",
        },
      );
      if (savePath) {
        const proseNode = document.querySelector(".prose");
        if (!proseNode) throw new Error("No preview found");

        // Dynamically import html2pdf to avoid bloating the initial load
        const html2pdf = (await import("html2pdf.js")).default;

        toast.loading("Generating PDF...", { id: "pdf-toast" });
        const pdfBlob = await html2pdf()
          .from(proseNode)
          .set({
            margin: 10,
            filename: "export.pdf",
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          })
          .output("blob");

        const arrayBuffer = await pdfBlob.arrayBuffer();
        await fileService.writeBinaryFile(savePath, arrayBuffer);
        toast.success("PDF Exported Successfully!", { id: "pdf-toast" });
      }
    } catch (e) {
      toast.error("PDF Export failed.", { id: "pdf-toast" });
      logger.error("PDF export error", e);
    }
  },
};
