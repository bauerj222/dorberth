import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leistungen",
  description: "Fassadengestaltung, Wandgestaltung, Anstrich & Tapete, Spachteltechnik, Nachtarbeit — Maler Dorberth in Fürth/Burgfarrnbach.",
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
