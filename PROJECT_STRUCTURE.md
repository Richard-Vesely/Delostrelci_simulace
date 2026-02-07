# 📁 Struktura projektu

```
c:\Users\risav\Delostrelci simulace\
│
├── 🌐 index.html          (3.5 KB)  Hlavní HTML stránka
│   ├── Left panel: Python editor (textarea)
│   ├── Controls: v₀, angle_deg, g inputs
│   ├── Buttons: Spustit, Reset
│   ├── Status panel: Loading/Ready/Running states
│   ├── Error panel: Czech error messages
│   └── Right panel: Canvas element
│
├── 🎨 style.css           (2.5 KB)  Vizuální styly
│   ├── 2-column grid layout
│   ├── Monospace textarea styling
│   ├── Button states (enabled/disabled)
│   ├── Error/status panel colors
│   ├── Canvas border & sizing
│   └── Responsive breakpoint (@1024px)
│
├── ⚙️ app.js              (12 KB)   Logika aplikace
│   ├── Pyodide loader from CDN (v0.26.4)
│   ├── DOM element wiring
│   ├── User code execution & validation
│   ├── Simulation loop (requestAnimationFrame)
│   │   ├── Fixed dt = 1/60 s
│   │   ├── Max time = 20 s
│   │   ├── Call getX(t, v0, angle_deg, g)
│   │   ├── Call getY(t, v0, angle_deg, g)
│   │   ├── Validate finite numbers
│   │   └── Stop conditions: y<0 or t>=tMax
│   ├── Canvas rendering
│   │   ├── Auto-fit viewport (world → pixels)
│   │   ├── Ground line at y=0
│   │   ├── Trail polyline (max 500 points)
│   │   ├── Ball circle (red)
│   │   └── Axis labels
│   └── Reset functionality
│
├── 📖 README.md           (2 KB)    Obecný přehled
│   ├── Popis projektu
│   ├── Technologie (Pyodide, Canvas)
│   ├── Lokální testování
│   ├── GitHub Pages deployment
│   └── Struktura souborů
│
├── 🧪 TESTING.md          (6 KB)    Testovací scénáře
│   ├── 1. Pyodide loading test
│   ├── 2. Happy path test
│   ├── 3. Parameter changes test
│   ├── 4-5. Missing function tests
│   ├── 6. Syntax error test
│   ├── 7. NaN/Infinity test
│   ├── 8. Max time limit test
│   ├── 9. Experimental trajectories
│   ├── 10. Responsive layout test
│   ├── 11. Trail visualization test
│   └── 12. Auto-fit viewport test
│
├── 🚀 DEPLOYMENT.md       (5 KB)    Deployment návod
│   ├── Krok 1: Vytvoření GitHub repo
│   ├── Krok 2: Nahrání souborů (Web/Git)
│   ├── Krok 3: Aktivace GitHub Pages
│   ├── Krok 4: Ověření deployment
│   ├── Krok 5: DevTools kontrola
│   ├── Řešení problémů
│   ├── Aktualizace stránky
│   └── Vlastní doména (volitelné)
│
├── 🚀 QUICK_START.md      (4 KB)    Rychlý start
│   ├── Přehled souborů
│   ├── Jak spustit lokálně (3 možnosti)
│   ├── Jak nahrát na GitHub Pages
│   ├── Jak to funguje (user + tech view)
│   ├── Příklady trajektorií
│   ├── Co dál? (testování, deployment)
│   ├── Troubleshooting
│   └── MVP Checklist ✅
│
└── 🔒 .gitignore          (200 B)   Git ignore pravidla
    ├── OS files (.DS_Store, Thumbs.db)
    ├── Editor dirs (.vscode, .idea)
    └── Logs (*.log)
```

## 🔑 Klíčové vlastnosti implementace

### ✅ MVP požadavky splněny
- [x] Single-page static site (HTML/CSS/JS)
- [x] No bundler, no build step
- [x] Pyodide from CDN (v0.26.4, ES modules)
- [x] Two-column layout (editor | canvas)
- [x] Python editor (textarea) with starter code
- [x] Controls: v0, angle_deg, g (number inputs)
- [x] Play/Reset buttons
- [x] Canvas 2D animation
- [x] User functions: getX/getY with exact signatures
- [x] Any trajectory allowed (no physics validation)
- [x] Ground collision detection (y < 0)
- [x] Max simulation time (20s)
- [x] Trail visualization (capped at 500 points)
- [x] Auto-fit viewport with margin
- [x] Czech UI text and error messages
- [x] Kid-friendly error messages
- [x] GitHub Pages ready (root deployment)

### 🛠️ Technická rozhodnutí

| Aspekt | Rozhodnutí | Odůvodnění |
|--------|-----------|-----------|
| **Python runtime** | Pyodide v0.26.4 from CDN | No server needed, works in browser |
| **Module system** | ES modules (`type="module"`) | Modern, clean imports |
| **Animation** | `requestAnimationFrame` | Smooth 60 FPS |
| **Time step** | Fixed `dt = 1/60` | Predictable simulation |
| **Max time** | `tMax = 20s` | Prevents infinite loops |
| **Trail cap** | 500 points | Performance vs visual quality |
| **Viewport** | Auto-fit with 10% margin | Always see full trajectory |
| **Coordinate system** | Origin (0,0), ground at y=0 | Intuitive for physics |
| **Language** | Czech UI | Target audience |
| **Layout** | CSS Grid 2-column | Clean, responsive |

### 📊 Datový tok

```
User writes Python code in <textarea>
              ↓
Click "Spustit" button
              ↓
app.js: pyodide.runPython(code)
              ↓
Extract getX & getY from globals
              ↓
Validate: both exist & callable
              ↓
Animation loop starts (rAF)
              ↓
Each frame (1/60s):
  ├─ t += dt
  ├─ x = getX(t, v0, angle_deg, g)
  ├─ y = getY(t, v0, angle_deg, g)
  ├─ Validate: isFinite(x) && isFinite(y)
  ├─ trail.push({x, y})
  ├─ Check: y < 0 ? STOP
  ├─ Check: t >= tMax ? STOP
  └─ render(trail, currentPoint)
              ↓
Canvas draws:
  ├─ Ground line (y=0)
  ├─ Trail polyline (blue)
  └─ Ball circle (red)
```

### 🎯 Starter kód funkcionalita

**Prefilled v textarea:**
- `import math`
- `def getX(t, v0, angle_deg, g):` - Complete working implementation
- `def getY(t, v0, angle_deg, g):` - Complete working implementation
- Degrees → radians conversion using `math.radians()`
- Standard projectile motion physics:
  - `x = v0 * cos(θ) * t`
  - `y = v0 * sin(θ) * t - 0.5 * g * t²`
- Czech docstrings explaining parameters
- Encouraging comment: "Můžeš vracet libovolnou křivku!"

### 🌐 Deployment cesta

```
Local development
       ↓
index.html + style.css + app.js
       ↓
Git commit to GitHub repo
       ↓
GitHub Settings → Pages
       ↓
Source: main branch, /(root)
       ↓
GitHub builds & deploys
       ↓
https://[username].github.io/[repo-name]/
       ↓
Pyodide loads from CDN
       ↓
Funkční stránka! ✅
```

## 📝 Poznámky

### Co NENÍ v MVP (dle specifikace)
- ❌ Multiple exercises/levels
- ❌ Score/validation/correctness checks
- ❌ User accounts/saving code/databases
- ❌ Mobile optimization (beyond basic responsive)
- ❌ Fancy editor (Monaco/CodeMirror)
- ❌ Target hitting mechanics
- ❌ Export/tables features

### Budoucí rozšíření (mimo scope)
- 💡 localStorage pro uložení kódu
- 💡 Více předpřipravených příkladů
- 💡 Visual feedback (velocity vector, max height, time of flight)
- 💡 Multiple canvases (compare trajectories)
- 💡 Export as GIF/video
- 💡 Playground/gallery of community trajectories

## ✅ Připraveno k použití

**Všechny soubory jsou hotové a otestované.**
**Lze nasadit na GitHub Pages během 5 minut.**
**Žádné další závislosti nejsou potřeba.**

🎉 **MVP je kompletní!**
