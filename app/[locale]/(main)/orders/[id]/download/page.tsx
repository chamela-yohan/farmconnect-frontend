"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";

export default function InvoiceDownloadPage() {
  const { id, locale } = useParams();
  const router = useRouter();
  
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        // 1. Get the fresh presigned URL from our secure backend
        const { data } = await api.get(`/orders/${id}/invoice-url`);
        setDownloadUrl(data.data);
      } catch (error: any) {
        console.error("Failed to get invoice URL", error);
        setError(error.response?.data?.message || "Failed to load invoice.");
        toast.error("Failed to load invoice. Please try again.");
      }
    };

    fetchUrl();
  }, [id]);

  // 2. Direct navigation handler (100% reliable, no CORS, no popup blockers)
  const handleDownload = () => {
    if (downloadUrl) {
      // Navigating directly to the presigned URL lets the browser handle the PDF natively
      window.location.href = downloadUrl;
    }
  };

  // 3. Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <p className="text-destructive mb-4 text-center px-4">{error}</p>
        <button 
          onClick={() => router.push(`/${locale}/orders`)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
        >
          Back to Orders
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Try Again
        </button>
      </div>
    );
  }

  // 4. Loading State
  if (!downloadUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Preparing your secure invoice...</p>
      </div>
    );
  }

  // 5. Ready State (User must click to download, satisfying browser security)
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background px-4">
      <div className="bg-card border border-border rounded-xl p-8 text-center max-w-sm w-full shadow-sm">
        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Download className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Invoice Ready</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Your invoice has been securely generated and is ready for download.
        </p>
        
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors mb-3"
        >
          Download PDF
        </button>
        
        <button
          onClick={() => router.push(`/${locale}/orders`)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Return to Orders
        </button>
      </div>
    </div>
  );
}