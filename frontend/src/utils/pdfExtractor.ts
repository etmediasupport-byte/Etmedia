import * as pdfjsLib from "pdfjs-dist";

// Set PDF worker URL to CDN to guarantee browser compatibility without Vite worker setup issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

/**
 * Extracts all pages of a PDF document into JPEG Data URLs.
 * 
 * @param source File object, ArrayBuffer, or PDF URL string
 * @param scale Quality scale factor (default: 1.5 for crisp magazine rendering)
 * @param onProgress Callback function reporting (currentDone, totalPages)
 * @returns Array of JPEG Data URL strings for each page
 */
export async function extractPdfPagesToDataUrls(
  source: File | ArrayBuffer | string,
  scale: number = 1.5,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  try {
    let pdfData: ArrayBuffer | { url: string };

    if (source instanceof File) {
      pdfData = await source.arrayBuffer();
    } else if (source instanceof ArrayBuffer) {
      pdfData = source;
    } else {
      pdfData = { url: source };
    }

    const loadingTask = pdfjsLib.getDocument(pdfData);
    const pdfDoc = await loadingTask.promise;
    const totalPages = pdfDoc.numPages;
    const pageDataUrls: string[] = [];

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas 2D context unavailable");
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      // Quality 0.85 JPEG balances high quality rendering with reasonable data URL size
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      pageDataUrls.push(dataUrl);

      if (onProgress) {
        onProgress(i, totalPages);
      }
    }

    return pageDataUrls;
  } catch (error) {
    console.error("Failed to extract pages from PDF:", error);
    throw error;
  }
}

/**
 * Safely parses pages_list from string (JSON array or delimited string), array, or null/undefined.
 * Correctly preserves Base64 Data URLs (data:image/jpeg;base64,...) which contain internal header commas!
 */
export function parsePagesList(input: any): string[] {
  if (!input) return [];

  // If already an array
  if (Array.isArray(input)) {
    return input.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof input !== "string") return [];
  const str = input.trim();
  if (!str) return [];

  // 1. Try JSON Array parsing (Recommended format)
  if (str.startsWith("[") && str.endsWith("]")) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch (e) {}
  }

  // 2. If contains data URLs, extract full data URLs safely without splitting header comma
  if (str.includes("data:image/")) {
    const matches = str.match(/data:image\/[a-zA-Z0-9+\-.]+;base64,[A-Za-z0-9+/=]+/g);
    if (matches && matches.length > 0) {
      return matches;
    }
  }

  // 3. Fallback for line-separated or comma-separated HTTP / relative URLs
  return str
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s && s !== "data:image/jpeg;base64" && s !== "data:image/png;base64");
}
