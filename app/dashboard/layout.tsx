import { TRPCProvider } from "@/trpc/client";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <TRPCProvider>{children}</TRPCProvider>;
}