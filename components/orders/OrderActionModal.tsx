"use client";

import { useState } from "react";
import { X, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface OrderActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => Promise<void>;
  actionType: "ACCEPT" | "REJECT";
  orderNumber: string;
  isPending: boolean;
}

export function OrderActionModal({ 
  isOpen, onClose, onConfirm, actionType, orderNumber, isPending 
}: OrderActionModalProps) {
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const isAccept = actionType === "ACCEPT";
  const title = isAccept ? "Accept Order Request" : "Reject Order Request";
  const description = isAccept 
    ? `You are about to accept order #${orderNumber}. Add any notes for the buyer (e.g., delivery time).`
    : `You are about to reject order #${orderNumber}. Please provide a reason so the buyer understands why.`;

  const handleConfirm = async () => {
    if (!isAccept && notes.trim().length < 3) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    try {
      await onConfirm(notes);
      toast.success(isAccept ? "Order accepted successfully!" : "Order rejected.");
      setNotes("");
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update order status.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className={`p-5 border-b border-border flex items-center justify-between ${isAccept ? 'bg-blue-50/50' : 'bg-red-50/50'}`}>
          <div className="flex items-center gap-3">
            {isAccept ? <CheckCircle2 className="w-5 h-5 text-blue-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">{description}</p>
          <div>
            <label className="text-sm font-medium mb-1 block">
              {isAccept ? "Notes for Buyer (Optional)" : "Reason for Rejection (Required)"}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={isAccept ? "e.g., I will deliver it by 5 PM today." : "e.g., Out of stock due to bad weather."}
              className="w-full p-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border flex justify-end gap-3 bg-muted/20">
          <button 
            onClick={onClose} 
            disabled={isPending}
            className="px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 flex items-center gap-2 ${
              isAccept ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isAccept ? "Confirm Acceptance" : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
}