export default function Footer() {
  return (
    <footer
      style={{
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#111",
        color: "#ccc",
        fontSize: "0.9rem",
      }}
    >
      © {new Date().getFullYear()} Midnight Photo Editor — All Rights Reserved
    </footer>
  );
}
