import React, { useEffect, useRef, useState } from 'react';
import InputPanel from './components/input';
import OutputPanel, { TimelineEntry } from './components/output';
import { createPdfObjectUrl, extractTextFromDocx, extractTextFromPdf, extractTextFromTxt } from './files/loader';
import './chronsorting.css';

interface Props {
  token: string;
}

export default function ChronSorting({ token }: Props) {
  const [file, setFile] = useState<File | null>(null); // Optional uploaded file
  const [loading, setLoading] = useState(false); // True while upload is in flight
  const [error, setError] = useState<string | null>(null); // Network or API error message
  const [output, setOutput] = useState<TimelineEntry[] | string | null>(null); // Response from the ChronSorting pipeline
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Object URL for PDF preview
  const [editedText, setEditedText] = useState<string | null>(null); // Editable text for .txt and .docx; null for PDF
  const [extractingPdf, setExtractingPdf] = useState(false); // True while PDF text extraction is running
  const fileInputRef = useRef<HTMLInputElement>(null); // Hidden file input element

  // Build or revoke the file preview whenever the selected file changes
  useEffect(() => {
    setPreviewUrl(null);
    setEditedText(null);
    if (!file) return;

    if (file.type === 'application/pdf') {
      const url = createPdfObjectUrl(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      extractTextFromTxt(file).then(setEditedText);
    }

    if (file.name.endsWith('.docx')) {
      extractTextFromDocx(file).then(setEditedText);
    }
  }, [file]);

  async function handleExtractPdf() {
    if (!file || !previewUrl) return;
    setExtractingPdf(true);
    try {
      const text = await extractTextFromPdf(file);
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setEditedText(text);
    } finally {
      setExtractingPdf(false);
    }
  }

  function handleRemoveFile() {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function sendData() {
    if (!file || loading) return;
    setError(null);
    setOutput(null);
    setLoading(true);
    try {
      const form = new FormData();
      // Send edited text as a new file if the user modified the content
      const payload = editedText !== null
        ? new File([editedText], file.name, { type: 'text/plain' })
        : file;
      form.append('file', payload);
      const res = await fetch('/api/v1/chronsorting', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.detail ?? `Request failed: ${res.status}`);
      } else {
        const raw = body.output ?? null;
        // Try to parse as a timeline array; fall back to raw string
        try {
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
          setOutput(Array.isArray(parsed) ? (parsed as TimelineEntry[]) : raw);
        } catch {
          setOutput(raw);
        }
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-page">
      <h2 className="app-title">ChronSorting</h2>
      <p className="app-subtitle">Upload a document and extract a structured chronological timeline of events.</p>

      {/* Split view — input (file preview) | output (timeline table) */}
      <div className="chron-split">
        <InputPanel
          previewUrl={previewUrl}
          editedText={editedText}
          extractingPdf={extractingPdf}
          loading={loading}
          onExtractPdf={handleExtractPdf}
          onEditedTextChange={setEditedText}
        />
        <OutputPanel output={output} loading={loading} />
      </div>

      {/* Actions centered below both panels */}
      <div className="chron-actions">
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          accept=".pdf,.txt,.docx"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          disabled={loading}
        />
        <button
          type="button"
          className="app-btn app-btn--lg"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          {file ? `File: ${file.name}` : 'Upload file'}
        </button>
        <button type="button" className="app-btn app-btn--lg" onClick={handleRemoveFile} disabled={!file || loading}>
          Remove
        </button>
        <button type="button" className="app-btn app-btn--lg" onClick={sendData} disabled={!file || loading}>
          {loading ? 'Uploading…' : 'Send'}
        </button>
        {error && <span className="app-error">{error}</span>}
      </div>
    </div>
  );
}
