import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Über uns",
  description: "Malermeister Ralf Dorberth — über 40 Jahre Erfahrung seit 1985. Ihr Maler im Großraum Nürnberg-Fürth-Erlangen.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
