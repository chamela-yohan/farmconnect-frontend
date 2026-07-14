"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Loader2 } from "lucide-react";
import { useCreateBooking } from "@/lib/api/booking";
import { toast } from "sonner";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    rentalPricePerDay: number;
    depositAmount: number;
  };
}

export function BookingModal({ isOpen, onClose, product }: BookingModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  const createBooking = useCreateBooking();

  // Calculate days and total price dynamically
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
    return diffDays > 0 ? diffDays : 0;
  };

  const days = calculateDays();
  const rentalTotal = days * product.rentalPricePerDay * quantity;
  const grandTotal = rentalTotal + product.depositAmount * quantity;

  useEffect(() => {
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setError("End date must be after start date.");
    } else if (
      startDate &&
      new Date(startDate) < new Date(new Date().setHours(0, 0, 0, 0))
    ) {
      setError("Start date cannot be in the past.");
    } else {
      setError("");
    }
  }, [startDate, endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (error || days <= 0) return;

    try {
      await createBooking.mutateAsync({
        productId: product.id,
        startDate,
        endDate,
        quantity,
        notes: notes || undefined,
      });
      onClose();
      setStartDate("");
      setEndDate("");
      setNotes("");
    } catch (err) {
      // Error handled by mutation onError (shows toast)
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Request Booking</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            Select the dates you need <strong>{product.title}</strong>.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full p-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split("T")[0]}
                className="w-full p-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <span className="w-1 h-1 bg-destructive rounded-full" /> {error}
            </p>
          )}

          <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
            <label className="text-sm font-medium">
              Number of Units (Tractors/Technicians)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-border hover:bg-background"
              >
                -
              </button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-border hover:bg-background"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Notes for Farmer (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., I will pick it up at 9 AM."
              rows={2}
              className="w-full p-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Dynamic Price Summary */}
          {days > 0 && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{days} day(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Rental ({days} x LKR {product.rentalPricePerDay}):
                </span>
                <span className="font-medium">
                  LKR {rentalTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Refundable Deposit:
                </span>
                <span className="font-medium">
                  LKR {product.depositAmount.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-base font-bold text-foreground">
                <span>Total Estimated:</span>
                <span className="text-primary">
                  LKR {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={createBooking.isPending}
              className="px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createBooking.isPending || days <= 0 || !!error}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {createBooking.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Send Booking Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
