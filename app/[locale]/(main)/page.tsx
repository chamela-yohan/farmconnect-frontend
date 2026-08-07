import { HeroSection } from "@/components/home/HeroSection";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <CategoryShowcase />
      {/* Fresh Listings + Today's Pick land in the next step */}
    </div>
  );
}