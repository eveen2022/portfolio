import type { Metadata } from "next";
import { ContactSection } from "@/components/sections/ContactSection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch.",
};

export default function ContactPage() {
  return <ContactSection />;
}
