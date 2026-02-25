"use client";

import { useRef, useState, useCallback } from "react";

export default function StepUpload({ file, preview, onFileChange, onNext }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer?.files?.[0] ?? e.target?.files?.[0];
      if (f) onFileChange(f);
    },
    [onFileChange]
  );

  const removeFile = (e) => {
    e.stopPropagation();
    onFileChange(null);
  };

  return (
    <div className="slide-in-right space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Upload Artwork</h2>
        <p className="text-sm text-purple-300/50">Choose the image for your NFT</p>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleFile}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`
          relative rounded-2xl border-2 border-dashed cursor-pointer
          transition-all duration-300 overflow-hidden
          ${
            isDragging
              ? "border-purple-400 bg-purple-500/5 glow-purple"
              : preview
                ? "border-purple-500/30 bg-transparent"
                : "border-purple-700/40 hover:border-purple-500/40 hover:bg-purple-500/5"
          }
          ${preview ? "p-0" : "p-12"}
        `}
      >
        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="preview"
              className="w-full max-h-[320px] object-contain"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={removeFile}
                className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-sm hover:bg-red-500/30 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-4">
              <svg
                className="w-6 h-6 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>
            <p className="text-purple-300/70 text-sm font-medium mb-1">
              Drop your image here
            </p>
            <p className="text-purple-500/50 text-xs">
              PNG, JPG, GIF, WEBP &middot; Max 10MB
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      <button
        onClick={onNext}
        disabled={!file}
        className={`
          w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300
          ${
            file
              ? "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-500/20"
              : "bg-purple-900/20 text-purple-500/40 cursor-not-allowed"
          }
        `}
      >
        Continue
      </button>
    </div>
  );
}
