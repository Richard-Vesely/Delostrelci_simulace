# Návod k nasazení - GitHub Pages

## Krok 1: Vytvoření GitHub repozitáře

1. Přihlaste se na GitHub.com
2. Klikněte na "+" v pravém horním rohu → "New repository"
3. Pojmenujte repozitář (např. "delostrelci-simulace")
4. Nastavte jako **Public** (nutné pro GitHub Pages zdarma)
5. Klikněte "Create repository"

## Krok 2: Nahrání souborů

### Varianta A: Přes webové rozhraní (jednodušší)

1. Na stránce nového repozitáře klikněte "uploading an existing file"
2. Přetáhněte tyto soubory:
   - `index.html`
   - `style.css`
   - `app.js`
   - `README.md` (volitelné)
   - `TESTING.md` (volitelné)
3. Klikněte "Commit changes"

### Varianta B: Přes Git (pokročilé)

```bash
# V adresáři projektu
git init
git add index.html style.css app.js README.md TESTING.md .gitignore
git commit -m "Initial commit: Pyodide projectile simulation"
git branch -M main
git remote add origin https://github.com/[username]/[repo-name].git
git push -u origin main
```

## Krok 3: Aktivace GitHub Pages

1. V repozitáři přejděte na **Settings** (nastavení)
2. V levém menu klikněte na **Pages**
3. V sekci "Source":
   - **Branch**: vyberte `main`
   - **Folder**: vyberte `/(root)`
4. Klikněte **Save**
5. Počkejte ~30-60 sekund

## Krok 4: Ověření

1. GitHub zobrazí URL: `https://[username].github.io/[repo-name]/`
2. Klikněte na URL nebo ji otevřete v novém okně
3. **Ověřte:**
   - Stránka se načte
   - Zobrazí se "Načítám Python…" → "Python načten. Připraveno ke spuštění."
   - Tlačítko "Spustit" je aktivní
   - Po kliknutí na "Spustit" se koule animuje
   - Zastaví se na zemi
   - "Reset" funguje

## Krok 5: Kontrola chyb (DevTools)

Otevřete Developer Tools (F12):

### Console
- **NESMÍ** obsahovat červené chyby
- Může obsahovat informační hlášky Pyodide (to je OK)

### Network
Filtr: Vše, pak obnovte stránku (Ctrl+R)

**Zkontrolujte úspěšné načtení (status 200):**
- `index.html`
- `style.css`
- `app.js`
- `pyodide.mjs` (z cdn.jsdelivr.net)
- `pyodide.asm.wasm` (může být velký, ~15-20 MB)
- `python_stdlib.zip` (~7-10 MB)

**Případné problémy:**
- ❌ 404 Not Found → soubor chybí nebo špatná cesta
- ❌ CORS error → zkontrolujte, že používáte `https://` URL (ne `http://`)
- ❌ Mixed Content → všechny resources musí být HTTPS

## Řešení problémů

### Stránka nefunguje (chyby v Console)
1. Zkontrolujte, že soubory jsou skutečně v root repozitáře (ne ve složce)
2. Zkontrolujte, že cesty v `index.html` jsou relativní: `./style.css`, `./app.js`
3. Zkontrolujte, že Pages je nastaven na `main` branch a `/(root)` folder

### Pyodide se nenačte
1. Zkontrolujte Network tab - měly by být CDN požadavky na `cdn.jsdelivr.net`
2. Zkuste otevřít stránku v anonymním/inkognito okně (vypne cache)
3. Ověřte, že neblokujete 3rd-party scripts (adblocker)

### "Načítám Python…" navždy
1. Otevřete Console - pravděpodobně je tam chyba
2. Zkontrolujte, že `app.js` obsahuje správný import:
   ```javascript
   import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.mjs';
   ```
3. Zkuste jiný prohlížeč (Chrome/Firefox/Edge)

### Layout vypadá špatně
1. Zkontrolujte, že `style.css` se načetl (Network tab)
2. Obnovte cache: Ctrl+Shift+R (nebo Cmd+Shift+R na Mac)

## Aktualizace stránky

Po změně souborů:

### Přes Web
1. Otevřete repozitář na GitHubu
2. Klikněte na soubor, který chcete změnit
3. Klikněte ikonu tužky (edit)
4. Proveďte změny
5. Klikněte "Commit changes"
6. Počkejte ~30 sekund a obnovte stránku

### Přes Git
```bash
git add .
git commit -m "Update: [popis změny]"
git push
```

## Vlastní doména (volitelné)

1. V Settings → Pages → Custom domain
2. Zadejte doménu (např. `simulace.example.com`)
3. U svého DNS poskytovatele vytvořte CNAME record:
   - Name: `simulace` (nebo `www`)
   - Target: `[username].github.io`
4. Počkejte na propagaci DNS (může trvat až 48h, obvykle pár hodin)

## Další možnosti

### Analytics (volitelné)
Přidejte Google Analytics nebo jiný tracking kód do `<head>` v `index.html`

### Custom 404 stránka (volitelné)
Vytvořte `404.html` v root repozitáře

### README badge (volitelné)
Do `README.md` přidejte:
```markdown
[![Live Demo](https://img.shields.io/badge/demo-live-green.svg)](https://[username].github.io/[repo-name]/)
```

## Hotovo! 🎉

Vaše simulace je nyní dostupná online na:
`https://[username].github.io/[repo-name]/`

Odkaz můžete sdílet s kýmkoliv - nevyžaduje registraci ani instalaci.
