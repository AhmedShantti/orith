import MinimalHeader from "@/components/MinimalHeader";

// Minimal checkout chrome: logo only, no nav links, no cart icon — matching
// Shopify/Amazon focused-checkout behaviour. Deliberately outside the (site)
// group so it does not inherit the storefront Navbar/Footer.
export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <MinimalHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
