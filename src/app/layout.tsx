import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "sonner";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
