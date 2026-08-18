import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminBar from "@/components/AdminBar";
import PageTransition from "@/components/PageTransition";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminBar />
      <Navbar />
      <main className="min-h-[70vh] bg-organic-texture">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
