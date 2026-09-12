import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";

export default function HomePage() {
  return (
    <MarketingLayout>
      <Hero />
      <Features />
    </MarketingLayout>
  );
}
