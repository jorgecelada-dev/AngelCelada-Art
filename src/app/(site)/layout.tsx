import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import FondoParallax from "@/components/FondoParallax";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="relative min-h-[70vh] overflow-x-clip">
        <FondoParallax />
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
