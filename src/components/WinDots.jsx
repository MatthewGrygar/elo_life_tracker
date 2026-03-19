export function WinDots({ wins, color = "#f0c040", size = 10 }) {
  const total = Math.max(wins, 5);
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: size, height: size, borderRadius: "50%",
            background: i < wins ? color : "rgba(255,255,255,0.1)",
            boxShadow: i < wins ? `0 0 6px ${color}` : "none",
            transition: "all .3s",
          }}
        />
      ))}
    </div>
  );
}
