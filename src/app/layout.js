import { Cinzel } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const cinzel = Cinzel({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cinzel",
  display: 'swap',
});

export const metadata = {
  title: "Denarii District",
  description: "A numismatic collection gallery.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* NETWORK OPTIMIZATION: Pre-connect to critical 3rd parties */}
        <link rel="preconnect" href="https://i.ibb.co" />
        <link rel="preconnect" href="https://ulqeoqjtwbmkzvnudbbv.supabase.co" /> 
        {/* (Note: Replace the supabase URL above with your actual NEXT_PUBLIC_SUPABASE_URL domain if different) */}
      </head>
      <body className={cinzel.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}