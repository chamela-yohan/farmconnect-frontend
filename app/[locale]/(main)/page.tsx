import { HeroSection } from "@/components/home/HeroSection";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { FreshListings } from "@/components/home/FreshListings";
import { TodaysPick } from "@/components/home/TodaysPick";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <CategoryShowcase />
      <FreshListings />
      <TodaysPick />
    </div>
  );
}