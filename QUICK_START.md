# 🚀 Rychlý start

## Co bylo vytvořeno

Kompletní MVP statická webová stránka pro výuku programování - simulace dělostřelce s Pythonem v prohlížeči.

## Soubory v projektu

### Hlavní soubory (nutné pro běh)
- ✅ **index.html** - Struktura stránky, editor, ovládání
- ✅ **style.css** - Vizuální styly a layout
- ✅ **app.js** - Pyodide integrace, simulace, animace

### Dokumentace
- 📖 **README.md** - Obecný přehled projektu
- 🧪 **TESTING.md** - Detailní testovací scénáře
- 🚀 **DEPLOYMENT.md** - Krok za krokem návod na GitHub Pages
- 📝 **QUICK_START.md** - Tento soubor

### Pomocné
- 🔒 **.gitignore** - Git ignore pravidla

## Jak spustit lokálně (hned teď)

### Možnost 1: Python (nejjednodušší)
```bash
cd "c:\Users\risav\Delostrelci simulace"
python -m http.server 8000
```
Pak otevřete: http://localhost:8000

### Možnost 2: Node.js
```bash
npx serve
```

### Možnost 3: VS Code Live Server
1. Otevřete složku v VS Code
2. Klikněte pravým na `index.html`
3. Zvolte "Open with Live Server"

## Jak nahrát na GitHub Pages

Kompletní návod: viz **DEPLOYMENT.md**

**Rychlý přehled:**
1. Vytvořte GitHub repozitář
2. Nahrajte soubory (min. index.html, style.css, app.js)
3. Settings → Pages → Source: `main` branch, `/(root)`
4. Hotovo! URL: `https://[username].github.io/[repo-name]/`

## Jak to funguje

### Pro studenty (kids)
1. Otevřete stránku
2. Počkejte na "Python načten"
3. Upravte funkce `getX` a `getY` v editoru
4. Klikněte "Spustit"
5. Sledujte, jak se koule pohybuje podle vašeho kódu
6. "Reset" vrátí vše na začátek

### Technicky
- **Pyodide** (Python v prohlížeči) se načte z CDN
- Při kliknutí na "Spustit":
  1. Kód z editoru se spustí v Pyodide
  2. Funkce `getX(t, ...)` a `getY(t, ...)` se extrahují
  3. Každý frame (1/60 s) se zavolají tyto funkce
  4. Canvas vykreslí kouli na pozici `(x, y)`
  5. Simulace skončí při `y < 0` (dopad) nebo `t >= 20s`

## Příklady trajektorií pro testování

### Základní parabola (už je v editoru)
```python
import math
def getX(t, v0, angle_deg, g):
    theta = math.radians(angle_deg)
    return v0 * math.cos(theta) * t

def getY(t, v0, angle_deg, g):
    theta = math.radians(angle_deg)
    return v0 * math.sin(theta) * t - 0.5 * g * t * t
```

### Kruh
```python
import math
def getX(t, v0, angle_deg, g):
    return 5 * math.cos(t)

def getY(t, v0, angle_deg, g):
    return 5 * math.sin(t) + 5
```

### Vlnovka
```python
import math
def getX(t, v0, angle_deg, g):
    return t * 2

def getY(t, v0, angle_deg, g):
    return 2 + math.sin(t * 3)
```

Více příkladů v **TESTING.md** → sekce 9.

## Co dál?

### Testování
1. Projděte všechny scénáře v **TESTING.md**
2. Zkuste různé parametry (v₀, úhel, g)
3. Experimentujte s vlastními trajektoriemi

### Deployment
1. Postupujte podle **DEPLOYMENT.md**
2. Ověřte, že vše funguje na GitHub Pages
3. Sdílejte URL s ostatními

### Iterace (budoucí vylepšení - mimo MVP)
- Více předpřipravených příkladů (tlačítka "Načíst příklad")
- Ulož/načti kód z localStorage
- Přidání více visual feedbacku (rychlostní vektor, max. výška, čas letu)
- Mobilní optimalizace (touch controls)
- Více jazykových mutací
- Export animace jako GIF/video

## Problémy?

### Stránka se nenačte
- Zkontrolujte konzoli (F12) - jsou tam chyby?
- Používáte lokální server? (kvůli ES modules)

### "Načítám Python…" nezmizí
- Zkontrolujte Network tab - načítá se Pyodide z CDN?
- Zkuste jiný prohlížeč
- Zkuste anonymní/inkognito okno

### Animace nefunguje
- Spustila se simulace? (tlačítko "Spustit")
- Jsou funkce správně pojmenovány? `getX` a `getY`
- Podívejte se do error panelu - je tam chyba?

Všechny detailní troubleshooting scénáře: **TESTING.md** a **DEPLOYMENT.md**

## MVP Checklist ✅

- ✅ Single-page HTML
- ✅ Python editor (textarea)
- ✅ Controls (v₀, angle_deg, g)
- ✅ Play/Reset buttons
- ✅ Canvas animation
- ✅ Pyodide from CDN
- ✅ User functions: getX/getY
- ✅ Error handling (Czech messages)
- ✅ Ground collision (y<0)
- ✅ Max time limit (20s)
- ✅ Trail visualization
- ✅ Auto-fit viewport
- ✅ Starter code with example
- ✅ No build step
- ✅ GitHub Pages ready
- ✅ Documentation (README, TESTING, DEPLOYMENT)

**Projekt je kompletní a připraven k použití!** 🎉
