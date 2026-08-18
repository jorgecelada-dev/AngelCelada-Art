import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminBar from "@/components/AdminBar";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminBar />
      <Navbar />
      <main className="min-h-[70vh] bg-organic-texture">{children}</main>
      <Footer />
    </>
  );
}
