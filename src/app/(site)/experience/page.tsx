import type { Metadata } from "next";
import { Timeline } from "@/components/sections/Timeline";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Experience",
  description: "Where I've worked and studied.",
};

export default function ExperiencePage() {
  return <Timeline />;
}
