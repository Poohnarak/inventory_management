import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Inventory Manager",
  description: "Sign in to your shop inventory management system",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
