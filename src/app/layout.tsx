import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/provider/ThemeProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="scrollbar-hide">
      <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
        <AuthProvider>
          {children}
          <Toaster richColors />
        </AuthProvider>
      </ ThemeProvider >
      </body>
    </html>
  );
}
