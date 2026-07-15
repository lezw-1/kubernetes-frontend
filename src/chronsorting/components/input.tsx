// Input panel — shows the uploaded file content and allows editing before sending

import React from 'react';

interface Props {
  previewUrl: string | null; // Blob URL for PDF embed
  editedText: string | null; // Editable text for .txt and .docx
  extractingPdf: boolean; // True while PDF text extraction is running
  loading: boolean; // True while upload is in flight
  onExtractPdf: () => void; // Trigger PDF-to-text extraction
  onEditedTextChange: (text: string) => void; // Update editable text
}

export default function InputPanel({ previewUrl, editedText, extractingPdf, loading, onExtractPdf, onEditedTextChange }: Props) {
  return (
    <div className="chron-panel">
      <div className="chron-panel__header">
        <span>Input</span>
        {previewUrl && (
          <button type="button" className="app-btn" onClick={onExtractPdf} disabled={extractingPdf || loading}>
            {extractingPdf ? 'Extracting…' : 'Edit as text'}
          </button>
        )}
      </div>
      <div className="chron-panel__body">
        {previewUrl && (
          <embed src={previewUrl} type="application/pdf" style={{ width: '100%', height: '100%' }} />
        )}
        {editedText !== null && (
          <textarea
            className="chron-textarea"
            value={editedText}
            onChange={(e) => onEditedTextChange(e.target.value)}
            disabled={loading}
          />
        )}
        {!previewUrl && editedText === null && (
          <p className="app-placeholder">Upload a file to preview it here.</p>
        )}
      </div>
    </div>
  );
}
