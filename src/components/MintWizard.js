"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import StepUpload from "./StepUpload";
import StepDetails from "./StepDetails";
import StepConfirm from "./StepConfirm";
import MintSuccess from "./MintSuccess";

const STEPS = ["Upload", "Details", "Mint"];

export default function MintWizard() {
  const [step, setStep] = useState(0);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [beneficiary, setBeneficiary] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [error, setError] = useState("");
  const [metadataUri, setMetadataUri] = useState("");
  const [txHash, setTxHash] = useState("");
  const [minted, setMinted] = useState(false);

  const handleFileChange = useCallback((f) => {
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    } else {
      setFile(null);
      setPreview(null);
    }
  }, []);

  const handleMint = async () => {
    setError("");
    setLoading(true);
    try {
      setLoadingStatus("Uploading image...");
      const imageForm = new FormData();
      imageForm.append("file", file);
      const imageRes = await axios.post("/api/pinata", imageForm);
      const imageCid = imageRes.data.IpfsHash;

      setLoadingStatus("Pinning metadata...");
      const metadata = {
        name: name.trim(),
        description: description.trim(),
        image: `ipfs://${imageCid}`,
      };
      const metaRes = await axios.post("/api/pinata", metadata, {
        headers: { "Content-Type": "application/json" },
      });
      const metaCid = metaRes.data.IpfsHash;
      setMetadataUri(`ipfs://${metaCid}`);

      setLoadingStatus("Minting on MOI...");
      const mintPayload = { metadataCid: metaCid };
      if (beneficiary.trim()) mintPayload.beneficiary = beneficiary.trim();
      const mintRes = await axios.post("/api/mint", mintPayload);
      setTxHash(mintRes.data.hash);
      setMinted(true);
    } catch (err) {
      setError(
        err?.response?.data?.error || err?.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
      setLoadingStatus("");
    }
  };

  const resetAll = () => {
    setStep(0);
    setFile(null);
    setPreview(null);
    setName("");
    setDescription("");
    setBeneficiary("");
    setError("");
    setMetadataUri("");
    setTxHash("");
    setMinted(false);
  };

  if (minted) {
    return (
      <MintSuccess
        txHash={txHash}
        metadataUri={metadataUri}
        image={preview}
        name={name}
        onMintAnother={resetAll}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-0">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`
                  step-dot w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                  transition-all duration-300
                  ${
                    i < step
                      ? "bg-purple-500 text-white"
                      : i === step
                        ? "active text-white"
                        : "bg-purple-900/30 text-purple-500/50 border border-purple-700/30"
                  }
                `}
              >
                {i < step ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  i <= step ? "text-purple-300" : "text-purple-600/40"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`
                  step-line w-16 h-px mx-2 mb-5
                  ${i < step ? "bg-purple-500" : "bg-purple-800/30"}
                `}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div>
        {step === 0 && (
          <StepUpload
            file={file}
            preview={preview}
            onFileChange={handleFileChange}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <StepDetails
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            beneficiary={beneficiary}
            setBeneficiary={setBeneficiary}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <StepConfirm
            preview={preview}
            name={name}
            description={description}
            beneficiary={beneficiary}
            loading={loading}
            loadingStatus={loadingStatus}
            error={error}
            onMint={handleMint}
            onBack={() => setStep(1)}
          />
        )}
      </div>
    </div>
  );
}
