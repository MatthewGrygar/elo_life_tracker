import { useState, useEffect, useCallback, useRef } from "react";
import { ref, onValue, set, get, off } from "firebase/database";
import { db } from "../firebase.js";

const INITIAL_LIVES = 20;

function makeCode() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

function freshSession(code) {
  return {
    code,
    phase: "waiting",   // waiting | setup | playing
    players: [
      { name: "Hráč 1", lives: INITIAL_LIVES, wins: 0, sheetName: null, notInList: false },
      { name: "Hráč 2", lives: INITIAL_LIVES, wins: 0, sheetName: null, notInList: false },
    ],
    updatedAt: Date.now(),
  };
}

/* ─── PC hook ─── */
export function usePCSession() {
  const [code]        = useState(makeCode);
  const [session, setSession] = useState(null);
  const [ready, setReady]     = useState(false);

  useEffect(() => {
    const r = ref(db, `sessions/${code}`);
    // Write initial state
    set(r, freshSession(code));

    const unsub = onValue(r, (snap) => {
      const val = snap.val();
      if (val) { setSession(val); setReady(true); }
    });

    return () => {
      off(r, "value", unsub);
      // Clean up session on unmount
      set(r, null);
    };
  }, [code]);

  return { code, session, ready };
}

/* ─── Mobile hook ─── */
export function useMobileSession() {
  const [inputCode, setInputCode] = useState("");
  const [session,   setSession]   = useState(null);
  const [status, setStatus] = useState("idle"); // idle | connecting | connected | error
  const unsubRef = useRef(null);

  const connect = useCallback(async (rawCode) => {
    const code = rawCode.trim();
    if (code.length !== 5) { setStatus("error"); return; }
    setStatus("connecting");

    const r = ref(db, `sessions/${code}`);
    const snap = await get(r);
    if (!snap.exists()) { setStatus("error"); return; }

    // Subscribe
    unsubRef.current = onValue(r, (s) => {
      const val = s.val();
      if (val) setSession(val);
      else setStatus("error");
    });
    setStatus("connected");
  }, []);

  const updateSession = useCallback((updater) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = typeof updater === "function" ? updater(prev) : updater;
      const withTs = { ...next, updatedAt: Date.now() };
      set(ref(db, `sessions/${prev.code}`), withTs);
      return withTs;
    });
  }, []);

  const startGame = useCallback((p1, p2) => {
    updateSession((prev) => ({
      ...prev,
      phase: "playing",
      players: [
        { ...prev.players[0], name: p1.name, sheetName: p1.sheetName, notInList: p1.notInList, lives: INITIAL_LIVES },
        { ...prev.players[1], name: p2.name, sheetName: p2.sheetName, notInList: p2.notInList, lives: INITIAL_LIVES },
      ],
    }));
  }, [updateSession]);

  const changeLives = useCallback((idx, delta) => {
    updateSession((prev) => ({
      ...prev,
      players: prev.players.map((p, i) =>
        i === idx ? { ...p, lives: Math.max(0, p.lives + delta) } : p
      ),
    }));
  }, [updateSession]);

  const recordWin = useCallback((winnerIdx) => {
    updateSession((prev) => ({
      ...prev,
      phase: "setup",
      players: prev.players.map((p, i) => ({
        ...p,
        lives: INITIAL_LIVES,
        wins: i === winnerIdx ? p.wins + 1 : p.wins,
        sheetName: p.sheetName,
        notInList: p.notInList,
        name: p.name,
      })),
    }));
  }, [updateSession]);

  useEffect(() => {
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, []);

  return {
    inputCode, setInputCode,
    session, status,
    connect, startGame, changeLives, recordWin,
  };
}
