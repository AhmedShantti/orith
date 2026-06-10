import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementsBar from "@/components/AnnouncementsBar";

// Public storefront shell — navbar + footer. The admin dashboard lives outside
// this group and deliberately does NOT inherit this chrome.
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementsBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
