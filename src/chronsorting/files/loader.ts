// Utilities to extract text content from uploaded files

import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Point PDF.js at its bundled worker
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

/** Create a blob URL for inline PDF preview. Caller must revoke when done. */
export function createPdfObjectUrl(file: File): string {
  return URL.createObjectURL(file);
}

/** Read a plain-text file and return its content as a string. */
export function extractTextFromTxt(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string ?? '');
    reader.readAsText(file);
  });
}

/** Convert a .docx file to plain text via mammoth. */
export async function extractTextFromDocx(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return result.value;
}

/** Extract all text from a PDF, one page per paragraph. */
export async function extractTextFromPdf(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const pageTexts = await Promise.all(
    Array.from({ length: pdf.numPages }, (_, i) =>
      pdf.getPage(i + 1)
        .then((page) => page.getTextContent())
        .then((tc) => tc.items.map((item) => ('str' in item ? item.str : '')).join(' '))
    )
  );
  return pageTexts.join('\n\n');
}
