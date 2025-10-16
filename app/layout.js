import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata = {
  title: "Midnight Photo Editor",
  description:
    "Edit your pictures with cool filters like Midnight, Vintage, and more.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header /> {/* 🔹 Always visible on every page */}
        <main>{children}</main> {/* 🔹 Page content changes here */}
        <Footer /> {/* 🔹 Always visible on every page */}
      </body>
    </html>
  );
}
