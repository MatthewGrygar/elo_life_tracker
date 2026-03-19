# Life Tracker 🎴

Webová aplikace pro sledování životů ve dvouhráčových hrách.  
PC = zobrazení statistik a životů v reálném čase | Mobil = ovládání

---

## Rychlý start

```bash
npm install
# Vyplň .env (viz níže)
npm run dev
```

---

## Nastavení

### 1. Firebase – Realtime Database

1. Jdi na [console.firebase.google.com](https://console.firebase.google.com)
2. **Vytvořit projekt** → Build → **Realtime Database** → Create (europe-west1, test mode)
3. Nastavení projektu → **Your apps** → `</>` → zkopíruj `firebaseConfig`

### 2. Google Sheets

Sheet musí být **veřejně sdílený** (Sdílet → Kdokoliv s odkazem → Zobrazit).  
List se musí jmenovat **`Tournament_Elo`**.

### 3. `.env` soubor

Zkopíruj `.env.example` → `.env`, vyplň:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=projekt.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://projekt-default-rtdb.europe-west1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=projekt
VITE_FIREBASE_STORAGE_BUCKET=projekt.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123...

VITE_SHEET_ID=1y98bzsIRpVv0_cGNfbITapucO5A6izeEz5lTM92ZbIA
```

---

## Jak to funguje

```
1. PC otevře stránku → klikne POČÍTAČ
   └─ vygeneruje se náhodný 5místný kód (např. 48271)
   └─ PC čeká – zobrazuje kód

2. Mobil otevře stránku → klikne MOBIL → zadá kód
   └─ propojí se s PC relací přes Firebase

3. Mobil: výběr hráčů (2 panely vedle sebe)
   └─ autocomplete našeptávač ze sheetu
   └─ "NEJSEM V SEZNAMU" pokud hráč není v DB
   └─ tlačítko HRÁT

4. Hra
   └─ Mobil: životy +/−, hráči otočení ke svému kraji, DOHRÁNO uprostřed
   └─ PC: životy nahoře (live update), statistiky + srovnávací graf pod tím

5. DOHRÁNO → kdo vyhrál? → výhra přičtena, reset na 20/20 → zpět na výběr
```

---

## Sloupce Tournament_Elo

| Sloupec | Data      |
|---------|-----------|
| A       | Jméno     |
| B       | ELO       |
| C       | Počet her |
| D       | Výhry     |
| E       | Prohry    |
| F       | Winrate   |
| G       | Remízy    |
| H       | Peak ELO  |

---

## GitHub Pages nasazení

V `vite.config.js` přidej `base`:

```js
export default defineConfig({
  plugins: [react()],
  base: '/NAZEV-REPOZITARE/',
})
```

```bash
npm run build
# Nahraj dist/ na GitHub Pages
```

Firebase pravidla pro produkci:

```json
{
  "rules": {
    "sessions": {
      "$code": { ".read": true, ".write": true }
    }
  }
}
```

---

## Struktura

```
src/
├── App.jsx               ← routing: landing / PC / mobil
├── firebase.js
├── main.jsx
├── hooks/
│   ├── useSession.js     ← 5místný kód + Firebase sync
│   └── useSheets.js      ← Google Sheets CSV
└── components/
    ├── PCView.jsx        ← PCWaiting + PCView
    ├── MobileView.jsx    ← MobileSetup + MobileGame
    └── WinDots.jsx
```
