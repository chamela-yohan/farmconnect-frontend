"use client";

import { 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  Package, 
  AlertCircle 
} from "lucide-react";

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    PENDING: { 
      color: "bg-amber-100 text-amber-800 border-amber-200", 
      icon: <Clock className="w-3 h-3" />, 
      label: "Pending Review" 
    },
    ACCEPTED: { 
      color: "bg-blue-100 text-blue-800 border-blue-200", 
      icon: <CheckCircle2 className="w-3 h-3" />, 
      label: "Accepted" 
    },
    PREPARING: { 
      color: "bg-indigo-100 text-indigo-800 border-indigo-200", 
      icon: <Package className="w-3 h-3" />, 
      label: "Preparing" 
    },
    OUT_FOR_DELIVERY: { 
      color: "bg-purple-100 text-purple-800 border-purple-200", 
      icon: <Truck className="w-3 h-3" />, 
      label: "Out for Delivery" 
    },
    DELIVERED: { 
      color: "bg-green-100 text-green-800 border-green-200", 
      icon: <CheckCircle2 className="w-3 h-3" />, 
      label: "Delivered" 
    },
    REJECTED: { 
      color: "bg-red-100 text-red-800 border-red-200", 
      icon: <XCircle className="w-3 h-3" />, 
      label: "Rejected" 
    },
    CANCELLED: { 
      color: "bg-gray-100 text-gray-800 border-gray-200", 
      icon: <AlertCircle className="w-3 h-3" />, 
      label: "Cancelled" 
    },
  };

  const current = config[status] || config.PENDING;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${current.color}`}>
      {current.icon}
      {current.label}
    </span>
  );
}