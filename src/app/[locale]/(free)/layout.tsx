import Navbar from "@/components/layout/navbar/navbar";
import Footer from "@/components/layout/footer/footer";
import { Toaster } from "sonner";

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-50" />
      <div className="pointer-events-none absolute -left-40 top-10 h-80 w-80 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl" />
      <Navbar />
      <div className="relative z-10">{children}</div>
      <Footer locale={locale} />
      <Toaster richColors position="top-center" theme="light" duration={3000} />
    </div>
  );
}
