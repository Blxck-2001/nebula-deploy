import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { ResourcesHero } from "@/components/recursos/ResourcesHero";
import { ResourceCategories } from "@/components/recursos/ResourceCategories";
import { ResourceShowcase } from "@/components/recursos/ResourceShowcase";
import { ResourceIntegrations } from "@/components/recursos/ResourceIntegrations";
import { ResourcesCTA } from "@/components/recursos/ResourcesCTA";

export const metadata: Metadata = {
  title: "Recursos — Nebula Deploy",
  description:
    "Deploy automatizado, containers Docker, logs em tempo real e controle total. Conheça todos os recursos do Nebula Deploy.",
};

export default function RecursosPage() {
  return (
    <MarketingLayout>
      <ResourcesHero />
      <ResourceCategories />
      <ResourceShowcase />
      <ResourceIntegrations />
      <ResourcesCTA />
    </MarketingLayout>
  );
}
