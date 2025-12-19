// Login page layout - no separate AdminAuthProvider needed
// The parent /admin/layout.tsx already provides AdminAuthProvider

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
