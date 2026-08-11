import type { Metadata } from "next";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description: "Background, and the technologies I work with.",
};

export default function AboutPage() {
  return (
    <>
      <About />
      <Skills />
    </>
  );
}
