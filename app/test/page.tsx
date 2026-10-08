export default function TestPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", padding: "80px 4vw 48px" }}>
      <h1 style={{ color: "white", fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        Test Page
      </h1>
      <div style={{ maxWidth: 1200, margin: "0 auto", aspectRatio: "16 / 9", background: "#000", borderRadius: 8, overflow: "hidden" }}>
        <iframe
          src="https://megaplay.buzz/stream/ani/16498/1/dub"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          allowFullScreen
        />
      </div>
    </main>
  );
}
