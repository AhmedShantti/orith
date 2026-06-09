import MinimalHeader from "@/components/MinimalHeader";

export default function OrderLayout({
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
