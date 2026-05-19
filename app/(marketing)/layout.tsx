import { FloatingNavbar } from "@/components/nav/FloatingNavbar";
import { Footer } from "@/components/nav/Footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FloatingNavbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
