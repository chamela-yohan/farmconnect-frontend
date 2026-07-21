"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { useCreateReview } from "@/lib/api/reviews";
import { StarRating } from "./StarRating";
import { toast } from "sonner";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

export function ReviewModal({ isOpen, onClose, orderId }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const createReview = useCreateReview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }

    await createReview.mutateAsync({
      orderId,
      rating,
      comment: comment.trim() || undefined,
    });
    
    onClose();
    setRating(0);
    setComment("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-foreground">Leave a Review</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Your Rating</label>
            <StarRating rating={rating} onRatingChange={setRating} interactive size="lg" />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Your Experience (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder:text-muted-foreground"
              placeholder="How was the product quality and delivery?"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right mt-1">{comment.length}/500</p>
          </div>

          <button
            type="submit"
            disabled={createReview.isPending || rating === 0}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {createReview.isPending ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}