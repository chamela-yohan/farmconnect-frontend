import { FarmerSidebar } from "@/components/farmer/FarmerSidebar";

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:flex lg:min-h-[calc(100vh-4rem)]">
      <FarmerSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}