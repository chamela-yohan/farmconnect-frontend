"use client";

import { useAdminPendingKycs, useReviewKyc } from "@/lib/api/kyc";
import { Loader2, CheckCircle2, XCircle, FileText, Camera } from "lucide-react";
import { useState } from "react";

export default function AdminKycReviewPage() {
  const { data: kycs, isLoading } = useAdminPendingKycs();
  const reviewMutation = useReviewKyc();
  const [rejectionReason, setRejectionReason] = useState("");

  const handleReview = (kycId: string, status: string) => {
    if (status === "REJECTED" && !rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    reviewMutation.mutate({ kycId, status, rejectionReason });
    setRejectionReason("");
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-foreground">KYC Verification Requests</h2>
      
      {kycs && kycs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No pending KYC requests.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {kycs?.map((kyc) => (
            <div key={kyc.id} className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-foreground">NIC: {kyc.nicNumber}</h3>
                  <p className="text-xs text-muted-foreground">Submitted: {new Date(kyc.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Document Previews (Using Presigned URLs) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><FileText className="w-3 h-3" /> NIC Document</p>
                  {kyc.nicImageUrl.endsWith('.pdf') ? (
                    <a href={kyc.nicImageUrl} target="_blank" rel="noopener noreferrer" className="block p-4 bg-muted rounded-lg text-center text-sm text-primary hover:underline">View PDF</a>
                  ) : (
                    <img src={kyc.nicImageUrl} alt="NIC" className="w-full h-32 object-cover rounded-lg border border-border" />
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Camera className="w-3 h-3" /> Live Photo</p>
                  <img src={kyc.livePhotoUrl} alt="Live Photo" className="w-full h-32 object-cover rounded-lg border border-border" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Rejection reason (if rejecting)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={() => handleReview(kyc.id, "APPROVED")}
                  disabled={reviewMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => handleReview(kyc.id, "REJECTED")}
                  disabled={reviewMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}