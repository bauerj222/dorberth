import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Kontaktieren Sie Maler Dorberth in Fürth/Burgfarrnbach. Tel: 0911 977 949 71, Email: maler-dorberth@t-online.de",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
