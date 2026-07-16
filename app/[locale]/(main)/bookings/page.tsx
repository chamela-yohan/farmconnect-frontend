"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useBuyerBookings } from "@/lib/api/booking";
import { BookingStatus } from "@/types/booking";
import { Loader2, Calendar, User, CheckCircle2, XCircle, Clock, AlertTriangle, Tractor } from "lucide-react";
import Link from "next/link";

export default function MyBookingsPage() {
  const locale = useLocale();
  const [activeStatus, setActiveStatus] = useState<string>("ALL");
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useBuyerBookings(activeStatus, page, 10);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", minimumFractionDigits: 0 }).format(price);

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat("en-LK", { month: "short", day: "numeric", year: "numeric" }).format(new Date(dateString));

  const tabs = ["ALL", "PENDING", "ACCEPTED", "ACTIVE", "COMPLETED", "REJECTED"];

  const getStatusBadge = (status: BookingStatus) => {
    const config: Record<BookingStatus, { color: string; icon: React.ReactNode; label: string }> = {
      PENDING: { color: "bg-amber-100 text-amber-800 border-amber-200", icon: <Clock className="w-3 h-3" />, label: "Pending Review" },
      ACCEPTED: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: <CheckCircle2 className="w-3 h-3" />, label: "Accepted" },
      ACTIVE: { color: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: <Calendar className="w-3 h-3" />, label: "Currently Rented" },
      COMPLETED: { color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle2 className="w-3 h-3" />, label: "Completed" },
      REJECTED: { color: "bg-red-100 text-red-800 border-red-200", icon: <XCircle className="w-3 h-3" />, label: "Rejected" },
      CANCELLED: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: <AlertTriangle className="w-3 h-3" />, label: "Cancelled" },
    };
    const current = config[status];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${current.color}`}>
        {current.icon}{current.label}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
        <p className="text-muted-foreground mt-1">Track your equipment rentals and service bookings.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveStatus(tab); setPage(0); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeStatus === tab ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : isError ? (
        <div className="text-center py-20 text-destructive">Failed to load bookings.</div>
      ) : data && data.content.length > 0 ? (
        <div className="space-y-6">
          {data.content.map((booking) => (
            <div key={booking.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="bg-muted/50 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border">
                <div className="flex items-center gap-3">
                  <Tractor className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground">{booking.productTitle}</span>
                  <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border">
                    Qty: {booking.quantity}
                  </span>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              {/* Body */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Rented From</p>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{booking.farmerName}</span>
                  </div>
                  {booking.farmerNotes && (
                    <p className="text-xs text-muted-foreground mt-2 italic">Note: "{booking.farmerNotes}"</p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Rental Period</p>
                  <p className="font-medium text-foreground">{formatDate(booking.startDate)} — {formatDate(booking.endDate)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{booking.totalDays} day(s)</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Paid</p>
                  <p className="text-xl font-bold text-primary">{formatPrice(booking.totalAmount)}</p>
                  <p className="text-xs text-muted-foreground mt-1">(Incl. {formatPrice(booking.depositAmount)} deposit)</p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-muted/20 border-t border-border flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Requested on {formatDate(booking.createdAt)}
                </span>
                {booking.status === 'ACCEPTED' && booking.buyerMobile && (
                  <a href={`tel:${booking.buyerMobile}`} className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                    <User className="w-3 h-3" /> Contact Farmer
                  </a>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div className="flex justify-center gap-2 pt-4">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={data.first} className="px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted disabled:opacity-50">Previous</button>
            <span className="px-4 py-2 text-sm text-muted-foreground">Page {data.number + 1} of {data.totalPages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={data.last} className="px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted disabled:opacity-50">Next</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Tractor className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">No bookings found</h3>
          <p className="text-muted-foreground mt-2">
            {activeStatus === 'ALL' 
              ? "You haven't booked any equipment or services yet." 
              : `You have no bookings with the status "${activeStatus}".`}
          </p>
          <Link href={`/${locale}/search`} className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Browse Equipment
          </Link>
        </div>
      )}
    </div>
  );
}