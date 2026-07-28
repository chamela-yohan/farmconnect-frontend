"use client";

import { useState } from "react";
import { Upload, FileText, Camera, Loader2 } from "lucide-react";
import { useSubmitKyc } from "@/lib/api/kyc";

export function KycSubmissionForm() {
  const [nicNumber, setNicNumber] = useState("");
  const [nicFile, setNicFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  const submitMutation = useSubmitKyc();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicFile || !photoFile) {
      alert("Please upload both your NIC and a live photo.");
      return;
    }

    const formData = new FormData();
    formData.append("nicNumber", nicNumber);
    formData.append("nicFile", nicFile);
    formData.append("livePhotoFile", photoFile);

    await submitMutation.mutateAsync(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto bg-card p-6 rounded-xl border border-border">
      <h2 className="text-2xl font-bold text-foreground">Farmer Verification (KYC)</h2>
      <p className="text-muted-foreground">To start selling on FarmConnect, please upload your National Identity Card and a live photo of yourself holding it.</p>

      {/* NIC Number */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">NIC Number</label>
        <input
          type="text"
          value={nicNumber}
          onChange={(e) => setNicNumber(e.target.value)}
          placeholder="e.g., 199012345678"
          className="w-full h-11 px-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      {/* NIC Upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Upload NIC (PDF or Image)</label>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FileText className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{nicFile ? nicFile.name : "Click to upload NIC"}</p>
          </div>
          <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => setNicFile(e.target.files?.[0] || null)} required />
        </label>
      </div>

      {/* Live Photo Upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Live Photo (Holding NIC)</label>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Camera className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{photoFile ? photoFile.name : "Click to upload live photo"}</p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} required />
        </label>
      </div>

      <button
        type="submit"
        disabled={submitMutation.isPending}
        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
      >
        {submitMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit for Verification"}
      </button>
    </form>
  );
}