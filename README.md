# MTG Match Tracker

Jednoduchá webová aplikace pro sledování MTG / TCG zápasů.
Žádný backend, žádná databáze – jen jeden HTML soubor.

## Funkce
- Výběr hráčů ze Google Sheets žebříčku
- Mobil: split-screen, každý hráč ovládá svou stranu
- PC: dashboard se statistikami a porovnáním
- Sledování životů (+5 / +1 / −1 / −5)
- Počítání výher v matchi (tečky)
- Tlačítko Dohráno → výběr vítěze → reset na 20:20

## Nasazení na GitHub Pages

1. Vytvoř nový **public** repozitář na GitHubu
2. Nahraj `index.html` (přímo přes web nebo git)
3. **Settings → Pages → Source: Deploy from branch → main → / (root)**
4. Za chvíli běží na `https://USERNAME.github.io/REPO/`

## Google Sheets

Tabulka musí být sdílená jako "Kdokoli s odkazem může zobrazit":
Sdílet → Změnit přístup → Kdokoli s odkazem → Prohlížeč

Sloupce listu (pořadí musí sedět):
A=jméno, B=ELO, C=hry, D=výhry, E=prohry, F=winrate, G=remízy, H=peak ELO
