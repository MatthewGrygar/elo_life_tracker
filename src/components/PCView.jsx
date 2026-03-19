import { WinDots } from "./WinDots.jsx";

/* ── Pulse animation injected once ── */
const styleEl = document.createElement("style");
styleEl.textContent = `
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.15)} }
  @keyframes ring  { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:0;transform:scale(2.2)} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
`;
document.head.appendChild(styleEl);

/* ── Waiting for mobile to connect ── */
export function PCWaiting({ code }) {
  return (
    <div style={S.root}>
      <div style={S.grain} />
      <div style={S.logo}>Life Tracker</div>
      <div style={S.sub}>Otevři aplikaci na mobilu, zvol MOBIL a zadej kód</div>

      <div style={S.codeRow}>
        {code.split("").map((d, i) => (
          <div key={i} style={S.digit}>{d}</div>
        ))}
      </div>

      <div style={S.hint}>5místný kód relace</div>

      <div style={{ position: "relative", width: 16, height: 16, zIndex: 2 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#40c070", animation: "pulse 2s ease-in-out infinite" }} />
        <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "1px solid rgba(64,192,112,.25)", animation: "ring 2s ease-in-out infinite" }} />
      </div>

      <div style={{ color: "#1e1e1e", fontFamily: "Rajdhani,sans-serif", fontSize: 10, letterSpacing: 4, marginTop: 32, zIndex: 2, animation: "blink 2.5s ease-in-out infinite" }}>
        ČEKÁM NA PŘIPOJENÍ…
      </div>
    </div>
  );
}

/* ── Stat comparison row ── */
function StatRow({ label, val1, val2, max, unit }) {
  const pct = (v) => max > 0 ? Math.min((v / max) * 100, 100) : 0;
  const fmt = (v) => unit === "%" ? v.toFixed(1) + "%" : Number.isInteger(v) ? String(v) : v.toFixed(1);

  return (
    <div style={S.statRow}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
        <span style={S.statVal}>{fmt(val1)}</span>
        <div style={S.track}>
          <div style={{
            ...S.bar, width: `${pct(val1)}%`, marginLeft: "auto",
            background: "linear-gradient(to left, #e05060, #7a1020)",
            boxShadow: "0 0 8px rgba(224,80,96,.3)",
          }} />
        </div>
      </div>
      <div style={S.statLabel}>{label}</div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={S.track}>
          <div style={{
            ...S.bar, width: `${pct(val2)}%`,
            background: "linear-gradient(to right, #40c070, #1a6030)",
            boxShadow: "0 0 8px rgba(64,192,112,.3)",
          }} />
        </div>
        <span style={S.statVal}>{fmt(val2)}</span>
      </div>
    </div>
  );
}

/* ── Player card ── */
function PlayerCard({ player, sheetData, side }) {
  const left   = side === "left";
  const accent = left ? "#e05060" : "#40c070";
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: left ? "flex-end" : "flex-start" }}>
      {sheetData ? (
        <>
          <div style={{ fontFamily: "Cinzel,serif", fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
            {sheetData.name}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8, flexDirection: left ? "row-reverse" : "row" }}>
            {[["POŘADÍ", `#${sheetData.rank}`, accent], ["ELO", sheetData.elo, "#fff"]].map(([lbl, v, c]) => (
              <div key={lbl} style={S.chip}>
                <span style={{ color: "#444", fontSize: 9, fontFamily: "Rajdhani,sans-serif", letterSpacing: 2 }}>{lbl}</span>
                <span style={{ color: c, fontSize: 20, fontFamily: "Cinzel,serif", fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ fontFamily: "Cinzel,serif", fontSize: 24, fontWeight: 900, color: "#fff" }}>
          {player.name}
          {player.notInList && <div style={{ fontSize: 10, color: "#2a2a2a", fontFamily: "Rajdhani,sans-serif", letterSpacing: 2, marginTop: 4 }}>NENÍ V DATABÁZI</div>}
        </div>
      )}
      <div style={{ marginTop: 10 }}><WinDots wins={player.wins} color={accent} /></div>
      <div style={{ color: "#333", fontSize: 11, fontFamily: "Rajdhani,sans-serif", letterSpacing: 2, marginTop: 4 }}>
        {player.wins} {wl(player.wins)}
      </div>
    </div>
  );
}

function wl(n) { return n === 1 ? "VÝHRA" : n >= 2 && n <= 4 ? "VÝHRY" : "VÝHER"; }

/* ── Main PC game view ── */
export function PCView({ session, sheetPlayers, maxValues }) {
  const [p1, p2] = session.players;
  const find = (p) => p.notInList ? null : sheetPlayers.find((s) => s.name === (p.sheetName || p.name)) ?? null;
  const s1 = find(p1);
  const s2 = find(p2);

  const STATS = [
    { label: "ELO",       key: "elo",     unit: "" },
    { label: "Peak ELO",  key: "peakElo", unit: "" },
    { label: "Počet her", key: "games",   unit: "" },
    { label: "Výhry",     key: "wins",    unit: "" },
    { label: "Prohry",    key: "losses",  unit: "" },
    { label: "Remízy",    key: "draws",   unit: "" },
    { label: "Winrate",   key: "winrate", unit: "%" },
  ];

  return (
    <div style={S.root}>
      <div style={S.grain} />

      {/* Lives */}
      <div style={S.livesBar}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
          <span style={{ fontFamily: "Cinzel,serif", fontSize: 12, color: "#e05060", letterSpacing: 3 }}>{p1.name}</span>
          <span style={liveStyle(p1.lives)}>{p1.lives}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{ color: "#181818", fontFamily: "Cinzel,serif", fontSize: 18 }}>VS</div>
          <div style={{ color: "#181818", fontSize: 9, fontFamily: "Rajdhani,sans-serif", letterSpacing: 3 }}>● ŽIVÉ</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
          <span style={{ fontFamily: "Cinzel,serif", fontSize: 12, color: "#40c070", letterSpacing: 3 }}>{p2.name}</span>
          <span style={liveStyle(p2.lives)}>{p2.lives}</span>
        </div>
      </div>

      <div style={S.hr} />

      {/* Player cards */}
      <div style={S.cardsRow}>
        <PlayerCard player={p1} sheetData={s1} side="left" />
        <div style={{ width: 1, background: "#0f0f0f", alignSelf: "stretch" }} />
        <PlayerCard player={p2} sheetData={s2} side="right" />
      </div>

      {/* Comparison */}
      {s1 && s2 ? (
        <div style={S.statsWrap}>
          <div style={S.axisHead}>
            <span style={{ color: "#e05060", fontFamily: "Rajdhani,sans-serif", fontSize: 11, letterSpacing: 2 }}>◀ {s1.name}</span>
            <span style={{ color: "#242424", fontFamily: "Rajdhani,sans-serif", fontSize: 11, letterSpacing: 4 }}>SROVNÁNÍ</span>
            <span style={{ color: "#40c070", fontFamily: "Rajdhani,sans-serif", fontSize: 11, letterSpacing: 2 }}>{s2.name} ▶</span>
          </div>
          <div style={S.axisLine} />
          {STATS.map(({ label, key, unit }) => (
            <StatRow key={key} label={label} val1={s1[key] ?? 0} val2={s2[key] ?? 0} max={maxValues[key] ?? 1} unit={unit} />
          ))}
        </div>
      ) : (
        <div style={{ color: "#1e1e1e", fontFamily: "Rajdhani,sans-serif", letterSpacing: 3, fontSize: 12, marginTop: 24 }}>
          Srovnání není k dispozici – alespoň jeden hráč není v databázi
        </div>
      )}
    </div>
  );
}

function liveStyle(lives) {
  return {
    fontFamily: "Cinzel,serif", fontSize: 96, fontWeight: 900, lineHeight: 1,
    color: lives <= 5 ? "#e05060" : "#fff",
    textShadow: lives <= 5 ? "0 0 50px rgba(224,80,96,.5)" : "0 0 20px rgba(255,255,255,.06)",
    transition: "color .3s",
  };
}

const grain = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E\")";

const S = {
  root: {
    minHeight: "100dvh", background: "#080808",
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "28px 48px", position: "relative", overflow: "hidden",
    gap: 0,
  },
  grain: { position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, backgroundImage: grain, opacity: .5 },
  logo:  { fontFamily: "Cinzel,serif", fontSize: 30, fontWeight: 900, color: "#fff", letterSpacing: 6, zIndex: 2, marginBottom: 6 },
  sub:   { color: "#282828", fontFamily: "Rajdhani,sans-serif", fontSize: 11, letterSpacing: 4, marginBottom: 36, zIndex: 2 },
  codeRow: { display: "flex", gap: 12, zIndex: 2, marginBottom: 16 },
  digit: {
    width: 72, height: 88, display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "Cinzel,serif", fontSize: 48, fontWeight: 900, color: "#fff",
    background: "rgba(255,255,255,.03)", border: "1px solid #1a1a1a", borderRadius: 14,
  },
  hint: { color: "#282828", fontFamily: "Rajdhani,sans-serif", fontSize: 11, letterSpacing: 4, zIndex: 2, marginBottom: 48 },
  livesBar: {
    display: "flex", width: "100%", maxWidth: 1040,
    alignItems: "center", justifyContent: "space-between",
    zIndex: 2, paddingBottom: 20,
  },
  hr: { width: "100%", maxWidth: 1040, height: 1, background: "#0f0f0f", marginBottom: 20, zIndex: 2 },
  cardsRow: { display: "flex", width: "100%", maxWidth: 1040, gap: 40, marginBottom: 32, zIndex: 2 },
  chip: {
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "4px 12px", background: "rgba(255,255,255,.03)",
    border: "1px solid #181818", borderRadius: 8,
  },
  statsWrap: { width: "100%", maxWidth: 1040, position: "relative", zIndex: 2 },
  axisHead:  { display: "flex", justifyContent: "space-between", marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid #0f0f0f" },
  axisLine:  {
    position: "absolute", left: "50%", top: 32, bottom: 0, width: 1,
    background: "linear-gradient(to bottom, transparent, #141414 5%, #141414 95%, transparent)",
    zIndex: 0,
  },
  statRow: { display: "flex", alignItems: "center", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,.015)", position: "relative", zIndex: 1 },
  statLabel: { width: 88, textAlign: "center", flexShrink: 0, fontFamily: "Rajdhani,sans-serif", fontSize: 11, letterSpacing: 2, color: "#272727" },
  track: { flex: 1, height: 8, display: "flex", alignItems: "center" },
  bar:   { height: "100%", borderRadius: 4, minWidth: 2, transition: "width .5s cubic-bezier(.25,.46,.45,.94)" },
  statVal: { fontFamily: "Rajdhani,sans-serif", fontSize: 13, fontWeight: 600, color: "#555", width: 52, flexShrink: 0, textAlign: "center" },
};
