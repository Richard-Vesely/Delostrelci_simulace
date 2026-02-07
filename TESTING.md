# Testovací scénáře - Simulace dělostřelce

## Ruční testování před nasazením

### 1. Pyodide načítání
**Očekávané chování:**
- Stránka zobrazí "Načítám Python…" (žlutý/oranžový status)
- Po načtení se změní na "Python načten. Připraveno ke spuštění." (zelený status)
- Tlačítko "Spustit" je nejprve disabled, poté se aktivuje

**Jak testovat:**
1. Otevřít `index.html` v prohlížeči
2. Sledovat status během načítání (obvykle 2-5 sekund)
3. Ověřit, že tlačítko "Spustit" je aktivní po načtení

---

### 2. Happy path - Základní funkčnost
**Očekávané chování:**
- Starter kód běží bez chyb
- Koule se animuje parabolickou dráhou
- Zastaví se při dopadu na zem (y < 0)
- Zobrazí "Simulace dokončena: dopad na zem."
- Reset vyčistí canvas a vrátí se na začátek

**Jak testovat:**
1. Po načtení stránky kliknout "Spustit"
2. Sledovat animaci koule (měla by lecet parabolou)
3. Ověřit, že se zastaví na zemi
4. Kliknout "Reset"
5. Ověřit, že se canvas vyčistil a čas se vrátil na 0

---

### 3. Změna parametrů
**Očekávané chování:**
- Změna v₀/úhel/g ovlivní trajektorii při dalším spuštění

**Jak testovat:**
1. Změnit v₀ na 20
2. Spustit simulaci - měla by lecet dál
3. Reset
4. Změnit úhel na 30
5. Spustit - měla by lecet níž a dál
6. Reset
7. Změnit g na 5
8. Spustit - měla by lecet výš a déle

---

### 4. Chybějící funkce getY
**Očekávané chování:**
- Zobrazí chybu: "Chybí funkce getY(t, v0, angle_deg, g)."
- Simulace se nespustí

**Jak testovat:**
1. V editoru smazat celou funkci `getY` (včetně def...)
2. Kliknout "Spustit"
3. Ověřit červený error panel s příslušnou zprávou

---

### 5. Chybějící funkce getX
**Očekávané chování:**
- Zobrazí chybu: "Chybí funkce getX(t, v0, angle_deg, g)."
- Simulace se nespustí

**Jak testovat:**
1. Reset a obnovit kód
2. Smazat celou funkci `getX`
3. Kliknout "Spustit"
4. Ověřit červený error panel

---

### 6. Syntaktická chyba v Python kódu
**Očekávané chování:**
- Zobrazí Python traceback v error panelu
- Simulace se nespustí

**Jak testovat:**
1. Reset a obnovit kód
2. Upravit např. řádek 29 na: `x = v0 * math.cos(theta) * t +` (neukončený výraz)
3. Kliknout "Spustit"
4. Ověřit, že se zobrazí Python traceback s "Chyba v Python kódu:"

---

### 7. Návrat neplatného čísla (NaN/Infinity)
**Očekávané chování:**
- Simulace se zastaví
- Zobrazí: "Funkce v čase t=... vrátila neplatné číslo (NaN/Infinity)."
- Ukáže hodnoty x a y

**Jak testovat:**
1. Reset a obnovit kód
2. Změnit funkci getY tak, aby vracela string:
   ```python
   def getY(t, v0, angle_deg, g):
       return "text"
   ```
3. Spustit simulaci
4. Ověřit chybovou zprávu

Alternativně:
```python
def getY(t, v0, angle_deg, g):
    return float('inf')  # nebo 1/0 pro výpočetní chybu
```

---

### 8. Y nikdy neklesne pod 0 (max time limit)
**Očekávané chování:**
- Simulace běží až do tMax (20 sekund)
- Zastaví se s: "Zastaveno: dosažen max. čas simulace (20 s)."

**Jak testovat:**
1. Reset a obnovit kód
2. Změnit funkci getY tak, aby vracela konstantu nad 0:
   ```python
   def getY(t, v0, angle_deg, g):
       return 10  # Konstantní výška
   ```
3. Spustit simulaci
4. Počkat ~20 sekund (nebo sledovat, může to být rychlejší kvůli dt stepping)
5. Ověřit stop zprávu

---

### 9. Experimentální trajektorie
**Očekávané chování:**
- Jakákoliv trajektorie funguje (není validována proti fyzice)

**Jak testovat - Kruh:**
```python
import math

def getX(t, v0, angle_deg, g):
    radius = 5
    return radius * math.cos(t)

def getY(t, v0, angle_deg, g):
    radius = 5
    return radius * math.sin(t) + radius  # Posun nahoru, aby začínalo nad zemí
```

**Jak testovat - Vlnovka:**
```python
import math

def getX(t, v0, angle_deg, g):
    return t * 2

def getY(t, v0, angle_deg, g):
    return 2 + math.sin(t * 3)
```

**Jak testovat - Spirála:**
```python
import math

def getX(t, v0, angle_deg, g):
    return t * math.cos(t * 2)

def getY(t, v0, angle_deg, g):
    return t * math.sin(t * 2) + 5
```

---

### 10. Responsivita
**Očekávané chování:**
- Layout se přizpůsobí menším obrazovkám
- Canvas se správně vykreslí

**Jak testovat:**
1. Zmenšit okno prohlížeče
2. Ověřit, že layout přepne do jednoho sloupce pod 1024px
3. Změnit velikost okna během animace
4. Ověřit, že canvas se správně přepočítá

---

### 11. Trail (stopa) koule
**Očekávané chování:**
- Během animace se vykresluje modrá čára (trail)
- Je omezena na 500 bodů

**Jak testovat:**
1. Spustit základní simulaci
2. Sledovat modrou čáru za koulí
3. Ověřit vizuální kvalitu

---

### 12. Automatické přizpůsobení viewportu
**Očekávané chování:**
- Canvas auto-fituje trajektorii s 10% marginem
- Zemní čára (y=0) je vždy viditelná

**Jak testovat:**
1. Spustit s různými parametry (malé/velké v₀)
2. Ověřit, že trajektorie je vždy vidět celá
3. Ověřit, že zelená zemní čára je vždy přítomná

---

## Deployment ověření (GitHub Pages)

Po nahrání na GitHub Pages:

1. **HTTPS funguje**: Ověřit, že stránka se načte přes https://
2. **Pyodide CDN**: Otevřít DevTools → Network, ověřit úspěšné stažení:
   - `pyodide.mjs`
   - `pyodide.asm.wasm`
   - `python_stdlib.zip`
3. **Žádné CORS chyby**: Zkontrolovat Console
4. **Funkční animace**: Provést basic happy path test

---

## Checklist před vypuštěním

- [ ] Všechny soubory (index.html, style.css, app.js) jsou v root repozitáře
- [ ] Pyodide loading funguje
- [ ] Happy path funguje
- [ ] Všechny error scénáře zobrazují správné České zprávy
- [ ] Reset správně vyčistí stav
- [ ] Experimentální trajektorie fungují
- [ ] Canvas se správně vykresluje a resizuje
- [ ] Responsivní layout funguje
- [ ] GitHub Pages deployment funguje
- [ ] Žádné CORS nebo 404 chyby v konzoli
