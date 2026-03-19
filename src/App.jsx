import { useState } from "react";
import { usePCSession, useMobileSession } from "./hooks/useSession.js";
import { useSheetData }                   from "./hooks/useSheets.js";
import { PCWaiting, PCView }              from "./components/PCView.jsx";
import { MobileSetup, MobileGame }        from "./components/MobileView.jsx";

/* ───────────────────────────────────── */
/*  Landing – choose mode               */
/* ───────────────────────────────────── */
function Landing({ onChoose }) {
  return (
    <div style={LS.root}>
      <div style={LS.grain} />
      <div style={LS.logo}>Life Tracker</div>
      <div style={LS.sub}>Vyber typ zařízení</div>

      <button style={{ ...LS.btn, borderColor: "#40c070", background: "rgba(64,192,112,.07)" }}
        onClick={() => onChoose("pc")}>
        <span style={LS.emoji}>🖥️</span>
        <span style={LS.btnTitle}>POČÍTAČ</span>
        <span style={LS.btnSub}>Zobrazení &amp; statistiky</span>
      </button>

      <button style={{ ...LS.btn, borderColor: "#4080c8", background: "rgba(64,128,200,.07)" }}
        onClick={() => onChoose("mobile")}>
        <span style={LS.emoji}>📱</span>
        <span style={LS.btnTitle}>MOBIL</span>
        <span style={LS.btnSub}>Ovládání hry</span>
      </button>
    </div>
  );
}

const grain = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E\")";

const LS = {
  root: {
    minHeight: "100dvh", background: "#080808",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: 16, padding: 32, position: "relative",
  },
  grain: { position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, backgroundImage: grain, opacity: .5 },
  logo:  { fontFamily: "Cinzel,serif", fontSize: 38, fontWeight: 900, color: "#fff", letterSpacing: 6, zIndex: 2, marginBottom: 4 },
  sub:   { fontFamily: "Rajdhani,sans-serif", fontSize: 11, color: "#282828", letterSpacing: 4, marginBottom: 24, zIndex: 2 },
  btn: {
    width: 260, padding: "22px 24px",
    border: "1px solid", borderRadius: 14,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    cursor: "pointer", zIndex: 2,
  },
  emoji:   { fontSize: 30 },
  btnTitle: { fontFamily: "Cinzel,serif", fontSize: 18, color: "#fff", letterSpacing: 3 },
  btnSub:   { fontFamily: "Rajdhani,sans-serif", fontSize: 11, color: "#444", letterSpacing: 2 },
};

/* ───────────────────────────────────── */
/*  PC wrapper                          */
/* ───────────────────────────────────── */
function PCApp() {
  const { code, session, ready } = usePCSession();
  const { players, maxValues }   = useSheetData();

  // While waiting for mobile to connect or select players
  const isPlaying = session?.phase === "playing";

  if (!ready || !isPlaying) return <PCWaiting code={code} />;

  return <PCView session={session} sheetPlayers={players} maxValues={maxValues} />;
}

/* ───────────────────────────────────── */
/*  Mobile wrapper                      */
/* ───────────────────────────────────── */
function MobileApp() {
  const {
    inputCode, setInputCode,
    session, status,
    connect, startGame, changeLives, recordWin,
  } = useMobileSession();

  const { players: sheetPlayers } = useSheetData();

  /* ── Enter code screen ── */
  if (status === "idle" || status === "error" || status === "connecting") {
    return (
      <div style={MS.root}>
        <div style={MS.grain} />
        <div style={MS.logo}>Life Tracker</div>
        <div style={MS.sub}>Zadej kód z počítače</div>

        {/* Code digit boxes */}
        <div style={MS.codeRow}>
          {[0,1,2,3,4].map((i) => (
            <div key={i} style={{
              ...MS.digitBox,
              borderColor: inputCode[i] ? "#4080c8" : "#1a1a1a",
              color: inputCode[i] ? "#fff" : "#222",
            }}>
              {inputCode[i] || "·"}
            </div>
          ))}
        </div>

        {/* Hidden real input overlaid */}
        <input
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
          inputMode="numeric"
          maxLength={5}
          placeholder="Kód…"
          style={MS.hiddenInput}
          autoFocus
        />

        {status === "error" && (
          <div style={{ color: "#e05060", fontFamily: "Rajdhani,sans-serif", fontSize: 12, letterSpacing: 2 }}>
            Kód nenalezen nebo vypršel
          </div>
        )}

        <button
          onClick={() => connect(inputCode)}
          style={{
            ...MS.connectBtn,
            opacity: inputCode.length === 5 ? 1 : .35,
            cursor: inputCode.length === 5 ? "pointer" : "not-allowed",
          }}
        >
          {status === "connecting" ? "PŘIPOJUJI…" : "PŘIPOJIT"}
        </button>
      </div>
    );
  }

  /* ── Setup: pick players ── */
  if (session?.phase === "setup" || session?.phase === "waiting") {
    return (
      <MobileSetup
        sheetPlayers={sheetPlayers}
        session={session}
        onStart={(p1, p2) => startGame(p1, p2)}
      />
    );
  }

  /* ── Game ── */
  return (
    <MobileGame
      session={session}
      onDelta={changeLives}
      onFinish={recordWin}
    />
  );
}

/* ───────────────────────────────────── */
/*  Root                                */
/* ───────────────────────────────────── */
export default function App() {
  const [mode, setMode] = useState(null);

  if (!mode)   return <Landing onChoose={setMode} />;
  if (mode === "pc") return <PCApp />;
  return <MobileApp />;
}

const MS = {
  root: {
    minHeight: "100dvh", background: "#080808",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: 20, padding: 32, position: "relative",
  },
  grain: { position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, backgroundImage: grain, opacity: .5 },
  logo:  { fontFamily: "Cinzel,serif", fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: 5, zIndex: 2 },
  sub:   { fontFamily: "Rajdhani,sans-serif", fontSize: 11, color: "#333", letterSpacing: 4, zIndex: 2 },
  codeRow: { display: "flex", gap: 10, zIndex: 2 },
  digitBox: {
    width: 52, height: 64, display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "Cinzel,serif", fontSize: 32, fontWeight: 900,
    background: "rgba(255,255,255,.03)", border: "2px solid",
    borderRadius: 10, transition: "border-color .2s",
    position: "relative", zIndex: 2,
  },
  hiddenInput: {
    position: "absolute", opacity: 0, width: 260, height: 64,
    zIndex: 3, fontSize: 16,
    // keep it tappable but invisible
  },
  connectBtn: {
    padding: "13px 40px", zIndex: 2,
    background: "rgba(64,128,200,.12)", border: "1px solid #2a5090",
    borderRadius: 30, color: "#6699cc",
    fontFamily: "Cinzel,serif", fontSize: 13, fontWeight: 700, letterSpacing: 4,
    transition: "opacity .2s",
  },
};
