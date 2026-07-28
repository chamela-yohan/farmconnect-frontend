"use client";

import { useMyKycStatus } from "@/lib/api/kyc";
import { KycSubmissionForm } from "@/components/farmer/KycSubmissionForm";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function VerificationPendingPage() {
  const { data: kyc, isLoading, isError } = useMyKycStatus();

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  // If no KYC record exists (404), show the submission form
  if (isError || !kyc) {
    return (
      <div className="container mx-auto px-4 py-8">
        <KycSubmissionForm />
      </div>
    );
  }

  // Status Views
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-card border border-border rounded-xl p-8 text-center space-y-6">
        {kyc.status === "PENDING" && (
          <>
            <Clock className="w-16 h-16 text-amber-500 mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Verification Pending</h2>
            <p className="text-muted-foreground">Your documents have been submitted and are currently under review by our admin team. This usually takes 24-48 hours.</p>
          </>
        )}

        {kyc.status === "APPROVED" && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">You are Verified!</h2>
            <p className="text-muted-foreground">You can now list products and receive orders.</p>
            <Link href="/en/dashboard/farmer" className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium">
              Go to Dashboard
            </Link>
          </>
        )}

        {kyc.status === "REJECTED" && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Verification Rejected</h2>
            <p className="text-muted-foreground">Reason: <span className="font-semibold text-destructive">{kyc.rejectionReason || "Documents were unclear."}</span></p>
            <p className="text-sm text-muted-foreground">Please upload clearer documents below.</p>
            <div className="mt-8 text-left">
              <KycSubmissionForm />
            </div>
          </>
        )}
      </div>
    </div>
  );
}