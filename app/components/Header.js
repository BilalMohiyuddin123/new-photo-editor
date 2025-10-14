"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>Midnight Photo Editor</h1>
      <nav className={styles.nav}>
        <Link href="/" className={pathname === "/" ? styles.active : ""}>
          Home
        </Link>
        <Link
          href="/edit"
          className={pathname === "/edit" ? styles.active : ""}
        >
          Edit
        </Link>
        <Link
          href="/about"
          className={pathname === "/about" ? styles.active : ""}
        >
          About
        </Link>
        <Link
          href="/contact"
          className={pathname === "/contact" ? styles.active : ""}
        >
          Contact
        </Link>
        <Link
          href="/privacy"
          className={pathname === "/privacy" ? styles.active : ""}
        >
          Privacy
        </Link>
      </nav>
    </header>
  );
}
