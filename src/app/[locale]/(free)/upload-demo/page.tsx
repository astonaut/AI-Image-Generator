"use client";

import { useState } from "react";

type UploadResponse = {
  fileKey?: string;
  uploadedFileUrl?: string;
  error?: string;
};

type PresignedResponse = {
  signedUrl?: string;
  expiresIn?: number;
  error?: string;
};

export default function UploadDemoPage() {
  const [status, setStatus] = useState("Select a file to upload.");
  const [fileKey, setFileKey] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [signedUrl, setSignedUrl] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("Uploading...");
    setFileKey("");
    setFileUrl("");
    setSignedUrl("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (response.ok) {
        setStatus("Upload succeeded.");
        const uploadedFileKey = data.fileKey || "";
        setFileKey(uploadedFileKey);
        setFileUrl(data.uploadedFileUrl || "");

        if (uploadedFileKey) {
          const presignedResponse = await fetch(
            `/api/presigned-url?fileKey=${encodeURIComponent(uploadedFileKey)}`
          );
          const presignedData: PresignedResponse = await presignedResponse.json();

          if (presignedResponse.ok && presignedData.signedUrl) {
            setSignedUrl(presignedData.signedUrl);
          } else {
            setStatus(
              `Upload succeeded, but failed to generate temporary URL: ${
                presignedData.error || "unknown error"
              }`
            );
          }
        }
      } else {
        setStatus(`Upload failed: ${data.error || "unknown error"}`);
      }
    } catch (error) {
      console.error("Upload request failed:", error);
      setStatus("Upload request failed, please retry.");
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Upload API Demo</h1>
      <p className="mt-2 text-slate-600">This page demonstrates FormData + fetch to call /api/upload.</p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label htmlFor="file-upload" className="mb-2 block text-sm font-semibold text-slate-700">
          Choose File
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          className="block w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-700"
        />

        <p id="upload-status" className="mt-4 text-sm font-medium text-slate-700">
          {status}
        </p>

        {fileKey && (
          <p className="mt-3 break-all text-sm text-slate-600">
            File key: <span className="font-mono">{fileKey}</span>
          </p>
        )}

        {fileUrl && (
          <p className="mt-2 break-all text-sm text-slate-600">
            Public URL:{" "}
            <a href={fileUrl} target="_blank" rel="noreferrer" className="text-cyan-700 underline">
              {fileUrl}
            </a>
          </p>
        )}

        {signedUrl && (
          <p className="mt-2 break-all text-sm text-slate-600">
            Signed URL (temporary):{" "}
            <a href={signedUrl} target="_blank" rel="noreferrer" className="text-cyan-700 underline">
              {signedUrl}
            </a>
          </p>
        )}
      </div>
    </main>
  );
}
