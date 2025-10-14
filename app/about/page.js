// app/about/page.js
import styles from "./About.module.css";

export default function AboutPage() {
  return (
    <div className={styles.about}>
      <h2>About Midnight Photo Editor</h2>
      <p>We make photo editing easy, stylish, and free for everyone.</p>
    </div>
  );
}
