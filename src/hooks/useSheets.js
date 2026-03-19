import { useState, useEffect } from "react";

const SHEET_ID = import.meta.env.VITE_SHEET_ID;

/**
 * Columns (0-indexed):
 * 0 = A – Jméno
 * 1 = B – ELO
 * 2 = C – Počet her
 * 3 = D – Výhry
 * 4 = E – Prohry
 * 5 = F – Winrate
 * 6 = G – Remízy
 * 7 = H – Peak ELO
 */
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const rows = lines.map((line) => {
    // Handle quoted fields
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === "," && !inQuotes) { result.push(current.trim()); current = ""; continue; }
      current += ch;
    }
    result.push(current.trim());
    return result;
  });
  return rows;
}

function toNum(val) {
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.,-]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

export function useSheetData() {
  const [players, setPlayers] = useState([]);
  const [maxValues, setMaxValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Tournament_Elo`;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => {
        const rows = parseCSV(text);
        // Skip header row (row 0 = A1..H1)
        const data = rows.slice(1).filter((r) => r[0]);

        const parsed = data.map((row, idx) => ({
          rank:     idx + 1,
          name:     row[0] || "",
          elo:      toNum(row[1]),
          games:    toNum(row[2]),
          wins:     toNum(row[3]),
          losses:   toNum(row[4]),
          winrate:  toNum(row[5]),
          draws:    toNum(row[6]),
          peakElo:  toNum(row[7]),
        }));

        // Compute max values across all players for the comparison bars
        const mx = {
          elo:     Math.max(...parsed.map((p) => p.elo),     1),
          games:   Math.max(...parsed.map((p) => p.games),   1),
          wins:    Math.max(...parsed.map((p) => p.wins),    1),
          losses:  Math.max(...parsed.map((p) => p.losses),  1),
          winrate: Math.max(...parsed.map((p) => p.winrate), 1),
          draws:   Math.max(...parsed.map((p) => p.draws),   1),
          peakElo: Math.max(...parsed.map((p) => p.peakElo), 1),
        };

        setPlayers(parsed);
        setMaxValues(mx);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { players, maxValues, loading, error };
}
