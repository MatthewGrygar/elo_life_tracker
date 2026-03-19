import { useState, useRef } from "react";
import { WinDots } from "./WinDots.jsx";

/* ─── Autocomplete search for one player ─── */
function PlayerSearch({ label, sheetPlayers, value, onChange }) {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState(value?.name || "");
  const inputRef            = useRef(null);

  const filtered = query.length > 0
    ? sheetPlayers.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : sheetPlayers.slice(0, 6);

  const pick = (p) => {
    setQuery(p.name);
    setOpen(false);
    onChange({ name: p.name, sheetName: p.name, notInList: false });
  };

  const notInList = () => {
    const name = query.trim() || label;
    setQuery(name);
    setOpen(false);
    onChange({ name, sheetName: null, notInList: true });
  };

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {/* Input */}
      <input
        ref={inputRef}
        value={query}
        placeholder={`Hledat hráče…`}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (e.target.value === "") onChange(null);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        style={IS.input}
      />

      {/* Dropdown */}
      {open && (
        <div style={IS.dropdown}>
          {filtered.map((p) => (
            <button key={p.name} onMouseDown={() => pick(p)} style={IS.item}>
              <span style={{ color: "#444", fontSize: 10, width: 22, flexShrink: 0 }}>#{p.rank}</span>
              <span style={{ flex: 1, color: "#ccc", textAlign: "left" }}>{p.name}</span>
              <span style={{ color: "#555", fontSize: 11 }}>{p.elo}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: "8px 12px", color: "#333", fontFamily: "Rajdhani,sans-serif", fontSize: 12 }}>Nenalezen</div>
          )}
        </div>
      )}

      {/* Not in list */}
      <button onMouseDown={notInList} style={IS.notInList}>
        NEJSEM V SEZNAMU
      </button>
    </div>
  );
}

const IS = {
  input: {
    width: "100%", padding: "10px 14px",
    background: "rgba(255,255,255,.05)", border: "1px solid #222",
    borderRadius: 8, color: "#fff",
    fontFamily: "Rajdhani,sans-serif", fontSize: 15, letterSpacing: 1,
    outline: "none", boxSizing: "border-box",
  },
  dropdown: {
    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
    background: "#111", border: "1px solid #222", borderRadius: 8,
    marginTop: 4, overflow: "hidden",
  },
  item: {
    display: "flex", alignItems: "center", gap: 8, width: "100%",
    padding: "9px 12px", background: "none", border: "none",
    cursor: "pointer", fontFamily: "Rajdhani,sans-serif", fontSize: 14,
    borderBottom: "1px solid #1a1a1a",
  },
  notInList: {
    marginTop: 8, padding: "5px 12px",
    background: "transparent", border: "1px solid #222",
    borderRadius: 20, color: "#333",
    fontFamily: "Rajdhani,sans-serif", fontSize: 10, letterSpacing: 3,
    cursor: "pointer", display: "block",
  },
};

/* ─── Setup screen (landscape-friendly, 2 panels + HRÁT) ─── */
export function MobileSetup({ sheetPlayers, session, onStart }) {
  const [picks, setPicks] = useState([null, null]);

  const set = (idx, val) => {
    const n = [...picks]; n[idx] = val; setPicks(n);
  };

  const canStart = picks[0] !== null && picks[1] !== null;

  return (
    <div style={SS.root}>
      <div style={SS.grain} />

      <div style={SS.logo}>Life Tracker</div>

      <div style={SS.panels}>
        {/* Player 1 */}
        <div style={SS.panel}>
          <div style={SS.panelLabel}>HRÁČ 1</div>
          {picks[0] && (
            <div style={SS.chosen}>
              {picks[0].name}
              <button onClick={() => set(0, null)} style={SS.clear}>✕</button>
            </div>
          )}
          <PlayerSearch
            label="Hráč 1"
            sheetPlayers={sheetPlayers}
            value={picks[0]}
            onChange={(v) => set(0, v)}
          />
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: "#161616", alignSelf: "stretch" }} />

        {/* Player 2 */}
        <div style={SS.panel}>
          <div style={SS.panelLabel}>HRÁČ 2</div>
          {picks[1] && (
            <div style={SS.chosen}>
              {picks[1].name}
              <button onClick={() => set(1, null)} style={SS.clear}>✕</button>
            </div>
          )}
          <PlayerSearch
            label="Hráč 2"
            sheetPlayers={sheetPlayers}
            value={picks[1]}
            onChange={(v) => set(1, v)}
          />
        </div>
      </div>

      {/* HRÁT */}
      <button
        onClick={() => canStart && onStart(picks[0], picks[1])}
        style={{
          ...SS.startBtn,
          opacity: canStart ? 1 : .3,
          cursor: canStart ? "pointer" : "not-allowed",
        }}
      >
        HRÁT
      </button>

      {session && (
        <div style={{ color: "#1e1e1e", fontFamily: "Rajdhani,sans-serif", fontSize: 9, letterSpacing: 3, marginTop: 12, zIndex: 2 }}>
          SESSION {session.code}
        </div>
      )}
    </div>
  );
}

const SS = {
  root: {
    minHeight: "100dvh", background: "#080808",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "20px 16px", position: "relative", overflow: "hidden", gap: 20,
  },
  grain: { position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E\")", opacity: .5 },
  logo: { fontFamily: "Cinzel,serif", fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: 5, zIndex: 2 },
  panels: { display: "flex", gap: 0, width: "100%", maxWidth: 480, zIndex: 2, border: "1px solid #1a1a1a", borderRadius: 14, overflow: "hidden" },
  panel: { flex: 1, padding: "16px 14px", display: "flex", flexDirection: "column", gap: 8 },
  panelLabel: { fontFamily: "Cinzel,serif", fontSize: 10, letterSpacing: 4, color: "#333", marginBottom: 2 },
  chosen: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    fontFamily: "Cinzel,serif", fontSize: 14, color: "#aaa",
    background: "rgba(255,255,255,.04)", borderRadius: 6, padding: "6px 10px",
  },
  clear: { background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: 12, padding: 0 },
  startBtn: {
    padding: "14px 48px", zIndex: 2,
    background: "rgba(64,120,200,.12)", border: "1px solid #2a5090",
    borderRadius: 30, color: "#6699cc",
    fontFamily: "Cinzel,serif", fontSize: 14, fontWeight: 700, letterSpacing: 4,
    transition: "opacity .2s",
  },
};

/* ─── Life button ─── */
function LifeBtn({ label, color, onTap }) {
  const [active, setActive] = useState(false);
  return (
    <button
      onPointerDown={() => setActive(true)}
      onPointerUp={() => { setActive(false); onTap(); }}
      onPointerLeave={() => setActive(false)}
      style={{
        width: 66, height: 66, borderRadius: "50%",
        background: active ? color : "transparent",
        border: `2px solid ${color}`,
        color: active ? "#000" : color,
        fontSize: 32, fontWeight: 900,
        cursor: "pointer", transition: "all .1s",
        transform: active ? "scale(.9)" : "scale(1)",
        userSelect: "none",
        display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
      }}
    >{label}</button>
  );
}

/* ─── One half panel ─── */
function HalfPanel({ player, idx, rotated, onDelta }) {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 4,
      transform: rotated ? "rotate(180deg)" : "none",
    }}>
      <div style={{ fontFamily: "Cinzel,serif", fontSize: 12, color: "#555", letterSpacing: 3 }}>
        {player.name}
      </div>
      <div style={{
        fontFamily: "Cinzel,serif", fontSize: 92, fontWeight: 900, lineHeight: 1,
        color: player.lives <= 5 ? "#e05060" : "#fff",
        textShadow: player.lives <= 5 ? "0 0 40px rgba(224,80,96,.5)" : "none",
        transition: "color .3s", minWidth: 120, textAlign: "center",
      }}>
        {player.lives}
      </div>
      <div style={{ display: "flex", gap: 26 }}>
        <LifeBtn label="−" color="#e05060" onTap={() => onDelta(idx, -1)} />
        <LifeBtn label="+" color="#40c070" onTap={() => onDelta(idx, +1)} />
      </div>
      <WinDots wins={player.wins} />
      <div style={{ color: "#333", fontSize: 10, fontFamily: "Rajdhani,sans-serif", letterSpacing: 2 }}>
        {player.wins} {wl(player.wins)}
      </div>
    </div>
  );
}

function wl(n) { return n === 1 ? "VÝHRA" : n >= 2 && n <= 4 ? "VÝHRY" : "VÝHER"; }

/* ─── Game play screen ─── */
export function MobileGame({ session, onDelta, onFinish }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={GS.root}>
      <div style={GS.grain} />

      <div style={GS.half}>
        <HalfPanel player={session.players[0]} idx={0} rotated onDelta={onDelta} />
      </div>

      <div style={GS.divLine} />

      {/* DOHRÁNO */}
      <div style={GS.center}>
        <button onClick={() => setShowModal(true)} style={GS.dohranoBtn}>DOHRÁNO</button>
      </div>

      <div style={GS.half}>
        <HalfPanel player={session.players[1]} idx={1} rotated={false} onDelta={onDelta} />
      </div>

      {/* Winner modal */}
      {showModal && (
        <div style={GS.overlay}>
          <div style={GS.modal}>
            <div style={{ fontFamily: "Cinzel,serif", fontSize: 18, color: "#fff", marginBottom: 24, letterSpacing: 2 }}>
              Kdo vyhrál?
            </div>
            {session.players.map((p, i) => (
              <button key={i}
                onClick={() => { onFinish(i); setShowModal(false); }}
                style={GS.winBtn}>
                🏆 {p.name}
              </button>
            ))}
            <button onClick={() => setShowModal(false)} style={GS.cancelBtn}>Zrušit</button>
          </div>
        </div>
      )}
    </div>
  );
}

const gGrain = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E\")";

const GS = {
  root: { width: "100%", height: "100dvh", background: "#080808", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" },
  grain: { position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, backgroundImage: gGrain, opacity: .5 },
  half: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 },
  divLine: { position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,#1e1e1e,transparent)", zIndex: 8 },
  center: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 20 },
  dohranoBtn: {
    padding: "8px 18px", background: "rgba(8,8,8,.97)", border: "1px solid #2a2a2a",
    borderRadius: 28, color: "#444",
    fontFamily: "Rajdhani,sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: 4, cursor: "pointer",
  },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.9)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal: { background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: 20, padding: "32px 28px", display: "flex", flexDirection: "column", alignItems: "center", minWidth: 230 },
  winBtn: { width: "100%", padding: "13px", background: "rgba(64,120,200,.1)", border: "1px solid #253a70", borderRadius: 10, color: "#88aaff", fontFamily: "Rajdhani,sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: 1, cursor: "pointer", marginBottom: 10 },
  cancelBtn: { padding: "9px 22px", background: "transparent", border: "1px solid #1e1e1e", borderRadius: 20, color: "#333", fontFamily: "Rajdhani,sans-serif", fontSize: 11, cursor: "pointer" },
};
