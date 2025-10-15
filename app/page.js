// app/page.js
import styles from "./Home.module.css";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className={styles.container}>
      <h2>Welcome bil to Midnight Photo Editor</h2>
      <p>Edit your pictures like a pro — apply filters, effects, and more!</p>

      <div className={styles.links}>
        <Link href="/edit">Start Editing</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </div>
    </div>
  );
}
