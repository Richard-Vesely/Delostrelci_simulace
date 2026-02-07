// Import Pyodide from CDN
import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.mjs';

// DOM elements
const codeTextarea = document.getElementById('code');
const v0Input = document.getElementById('v0');
const angleInput = document.getElementById('angle');
const gInput = document.getElementById('g');
const playBtn = document.getElementById('playBtn');
const resetBtn = document.getElementById('resetBtn');
const statusDiv = document.getElementById('status');
const errorDiv = document.getElementById('error');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Pyodide instance
let pyodide = null;

// Simulation state
let running = false;
let t = 0;
const dt = 1 / 60; // Fixed time step (60 FPS)
const tMax = 20; // Maximum simulation time (seconds)
let trail = []; // Array of {x, y} points
const maxTrailLength = 500;

// Fixed axis bounds for rendering (precalculated on start)
// { minX, maxX, minY, maxY } in world units
let axisBounds = null;

// Frozen canvas size during simulation so the y-axis doesn't "expand" when layout shifts
let simulationCanvasSize = null;

// User Python functions
let getX = null;
let getY = null;

// Animation frame tracking
let lastFrameTime = null;
let animationFrameId = null;

// Initialize Pyodide
async function initPyodide() {
    try {
        statusDiv.textContent = 'Načítám Python…';
        statusDiv.style.background = '#fff3cd';
        statusDiv.style.color = '#856404';
        
        pyodide = await loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
        });
        
        statusDiv.textContent = 'Python načten. Připraveno ke spuštění.';
        statusDiv.style.background = '#d5f4e6';
        statusDiv.style.color = '#27ae60';
        playBtn.disabled = false;
        
        // Initial render
        resizeCanvasToDisplaySize();
        renderInitialScene();
    } catch (err) {
        statusDiv.textContent = 'Chyba při načítání Pythonu.';
        statusDiv.style.background = '#fadbd8';
        statusDiv.style.color = '#c0392b';
        showError(`Nepodařilo se načíst Pyodide: ${err.message}`);
    }
}

// Resize canvas to match display size (skipped while simulation runs to keep axis scale fixed)
function resizeCanvasToDisplaySize() {
    if (running && simulationCanvasSize) {
        return simulationCanvasSize;
    }
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size to match display size (accounting for device pixel ratio)
    const width = Math.floor(rect.width * dpr);
    const height = Math.floor(rect.height * dpr);
    
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        
        // Scale context to match device pixel ratio
        ctx.scale(dpr, dpr);
    }
    
    // Return the CSS size for coordinate mapping
    return { width: rect.width, height: rect.height };
}

// Show error message
function showError(message) {
    errorDiv.textContent = message;
}

// Clear error message
function clearError() {
    errorDiv.textContent = '';
}

// Run user Python code and extract functions
function runUserCode() {
    clearError();
    
    const code = codeTextarea.value;
    
    try {
        // Execute user code in Pyodide
        pyodide.runPython(code);
        
        // Try to get getX function
        const getXProxy = pyodide.globals.get('getX');
        if (!getXProxy) {
            showError('Chybí funkce getX(t, v0, uhel, g).');
            return false;
        }
        
        // Try to get getY function
        const getYProxy = pyodide.globals.get('getY');
        if (!getYProxy) {
            showError('Chybí funkce getY(t, v0, uhel, g).');
            return false;
        }
        
        // Store function references
        getX = getXProxy;
        getY = getYProxy;
        
        return true;
    } catch (err) {
        // Show Python traceback
        showError(`Chyba v Python kódu:\n\n${err.message}`);
        return false;
    }
}

// Get current parameter values
function getParameters() {
    return {
        v0: parseFloat(v0Input.value) || 10,
        uhel: parseFloat(angleInput.value) || 45,
        g: parseFloat(gInput.value) || 9.81
    };
}

function precalculateAxisBoundsFromParams(params) {
    const v0 = Number(params.v0);
    const uhelDeg = Number(params.uhel);
    const g = Number(params.g);

    if (!isFinite(v0) || !isFinite(uhelDeg) || !isFinite(g)) {
        throw new Error('Parametry v0, úhel a g musí být platná čísla.');
    }
    if (g <= 0) {
        throw new Error('Pro výpočet os musí být g > 0.');
    }

    const theta = (uhelDeg * Math.PI) / 180;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    // User-specified closed-form axis maxima
    let yMax = (v0 * Math.sin(theta)) ** 2 / (2 * g);
    let xMax = (v0 * v0 * Math.sin(2 * theta)) / g;

    if (!isFinite(xMax) || !isFinite(yMax)) {
        throw new Error('Výpočet os vrátil neplatné číslo (NaN/Infinity).');
    }

    // We render in 0..max space (ignore negatives)
    xMax = Math.max(0, xMax);
    yMax = Math.max(0, yMax);

    // Add margin on the max side (~10%)
    xMax *= 1.3;
    yMax *= 1.3;

    // Avoid zero ranges
    if (xMax <= 0) xMax = 1;
    if (yMax <= 0) yMax = 1;

    return { minX: 0, maxX: xMax, minY: 0, maxY: yMax };
}

// Start simulation
function startSimulation() {
    if (!runUserCode()) {
        return;
    }
    
    // Reset state
    t = 0;
    trail = [];
    axisBounds = null;

    // Precalculate fixed axis bounds once (instant formula)
    try {
        axisBounds = precalculateAxisBoundsFromParams(getParameters());
    } catch (err) {
        showError(`Nepodařilo se vypočítat osy grafu:\n\n${err.message}`);
        statusDiv.textContent = 'Nelze spustit: chyba ve výpočtu os.';
        statusDiv.style.background = '#fadbd8';
        statusDiv.style.color = '#c0392b';
        return;
    }

    running = true;
    lastFrameTime = performance.now();
    // Freeze canvas size so scale (and y-axis) doesn't change when layout shifts during the run
    simulationCanvasSize = resizeCanvasToDisplaySize();

    statusDiv.textContent = 'Simulace běží…';
    statusDiv.style.background = '#d1ecf1';
    statusDiv.style.color = '#0c5460';
    
    playBtn.disabled = true;
    
    // Start animation loop
    animationFrameId = requestAnimationFrame(animate);
}

// Stop simulation
function stopSimulation(message = null) {
    running = false;
    simulationCanvasSize = null;
    playBtn.disabled = false;
    
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    if (message) {
        statusDiv.textContent = message;
        statusDiv.style.background = '#fff3cd';
        statusDiv.style.color = '#856404';
    } else {
        statusDiv.textContent = 'Simulace dokončena.';
        statusDiv.style.background = '#d5f4e6';
        statusDiv.style.color = '#27ae60';
    }
}

// Reset simulation
function resetSimulation() {
    stopSimulation();
    t = 0;
    trail = [];
    axisBounds = null;
    simulationCanvasSize = null;
    clearError();
    
    statusDiv.textContent = 'Python načten. Připraveno ke spuštění.';
    statusDiv.style.background = '#d5f4e6';
    statusDiv.style.color = '#27ae60';
    
    renderInitialScene();
}

// Animation loop
function animate(currentTime) {
    if (!running) return;
    
    const params = getParameters();
    
    // Fixed time step simulation (accumulator pattern)
    // Advance simulation by dt
    t += dt;
    
    // Check if exceeded max time
    if (t >= tMax) {
        stopSimulation(`Zastaveno: dosažen max. čas simulace (${tMax} s).`);
        render();
        return;
    }
    
    try {
        // Call user functions
        const xResult = getX(t, params.v0, params.uhel, params.g);
        const yResult = getY(t, params.v0, params.uhel, params.g);
        
        // Convert to JavaScript numbers
        const x = Number(xResult);
        const y = Number(yResult);
        
        // Validate numbers
        if (!isFinite(x) || !isFinite(y)) {
            stopSimulation();
            showError(`Funkce v čase t=${t.toFixed(2)} vrátila neplatné číslo (NaN/Infinity).\nx = ${xResult}, y = ${yResult}`);
            render();
            return;
        }
        
        // Check ground collision before adding point: stop when y <= 0
        if (y <= 0) {
            // Add final point exactly at y=0 for a clean graph (interpolate if we crossed below)
            if (trail.length > 0 && y < 0) {
                const prev = trail[trail.length - 1];
                if (prev.y > 0) {
                    const frac = prev.y / (prev.y - y);
                    const xGround = prev.x + frac * (x - prev.x);
                    trail.push({ x: xGround, y: 0 });
                }
            } else if (y === 0 || trail.length === 0) {
                trail.push({ x, y: 0 });
            }
            stopSimulation('Simulace dokončena: dopad na zem.');
            render();
            return;
        }
        
        // Add point to trail
        trail.push({ x, y });
        
        // Cap trail length
        if (trail.length > maxTrailLength) {
            trail.shift();
        }
        
        // Render current frame
        render();
        
        // Continue animation
        animationFrameId = requestAnimationFrame(animate);
        
    } catch (err) {
        stopSimulation();
        showError(`Chyba při volání funkce v čase t=${t.toFixed(2)}:\n\n${err.message}`);
        render();
    }
}

// Render the canvas
function render() {
    const size = resizeCanvasToDisplaySize();
    // During simulation use frozen size so the graph scale (and y-axis) doesn't change frame-to-frame
    const canvasW = (running && simulationCanvasSize) ? simulationCanvasSize.width : size.width;
    const canvasH = (running && simulationCanvasSize) ? simulationCanvasSize.height : size.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, canvasW, canvasH);
    
    // Compute bounds:
    // - Use fixed, precalculated bounds when available (set at simulation start)
    // - Never use trail-based bounds while simulation is running, so axes stay fixed
    // - When not running and no fixed bounds, use trail bounds for preview or preview from params
    let minX, maxX, minY, maxY;

    if (axisBounds) {
        ({ minX, maxX, minY, maxY } = axisBounds);
    } else if (!running && trail.length > 0) {
        // Only use trail-based bounds when simulation is stopped (e.g. after reset with trail)
        minX = 0;
        maxX = 0;
        minY = 0;
        maxY = 0;

        for (const point of trail) {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        }

        // Ensure ground (y=0) is included
        minY = Math.min(minY, 0);
        maxY = Math.max(maxY, 0);

        // Add margin (10%)
        const rangeX = maxX - minX || 1; // Avoid division by zero
        const rangeY = maxY - minY || 1;
        minX -= rangeX * 0.1;
        maxX += rangeX * 0.1;
        minY -= rangeY * 0.1;
        maxY += rangeY * 0.1;
    } else {
        // Empty scene before running: calculate axis bounds from current parameters
        // to show the graph box that will be used when Play is pressed
        try {
            const previewBounds = precalculateAxisBoundsFromParams(getParameters());
            ({ minX, maxX, minY, maxY } = previewBounds);
            // Fall through to draw the coordinate system with these bounds
        } catch (err) {
            // If parameter validation fails, fall back to simple view
            ctx.strokeStyle = '#27ae60';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, canvasH / 2);
            ctx.lineTo(canvasW, canvasH / 2);
            ctx.stroke();

            // Draw axis labels
            ctx.fillStyle = '#555';
            ctx.font = '12px sans-serif';
            ctx.fillText('y (m)', 10, 20);
            ctx.fillText('x (m)', canvasW - 50, canvasH - 10);

            return;
        }
    }
    
    // Compute scale
    const scaleX = canvasW / (maxX - minX);
    const scaleY = canvasH / (maxY - minY);
    
    // Map world coordinates to canvas pixels
    function worldToCanvas(x, y) {
        const px = (x - minX) * scaleX;
        const py = canvasH - (y - minY) * scaleY; // Invert Y axis
        return { px, py };
    }
    
    // Draw ground line at y=0
    const groundLeft = worldToCanvas(minX, 0);
    const groundRight = worldToCanvas(maxX, 0);
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(groundLeft.px, groundLeft.py);
    ctx.lineTo(groundRight.px, groundRight.py);
    ctx.stroke();

    // Draw expected trajectory (dashed, less visible) when getX/getY are available
    if (getX && getY) {
        const params = getParameters();
        const expectedPoints = [];
        const step = 0.02;
        let ti = 0;
        try {
            while (ti <= tMax) {
                const xVal = Number(getX(ti, params.v0, params.uhel, params.g));
                const yVal = Number(getY(ti, params.v0, params.uhel, params.g));
                if (!isFinite(xVal) || !isFinite(yVal)) break;
                if (yVal < 0) break;
                expectedPoints.push({ x: xVal, y: yVal });
                ti += step;
            }
            if (expectedPoints.length > 1) {
                ctx.save();
                ctx.setLineDash([6, 4]);
                ctx.strokeStyle = 'rgba(52, 152, 219, 0.35)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                const first = worldToCanvas(expectedPoints[0].x, expectedPoints[0].y);
                ctx.moveTo(first.px, first.py);
                for (let i = 1; i < expectedPoints.length; i++) {
                    const p = worldToCanvas(expectedPoints[i].x, expectedPoints[i].y);
                    ctx.lineTo(p.px, p.py);
                }
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.restore();
            }
        } catch (_) {
            // Ignore errors from user code during preview
        }
    }

    // Draw trail
    if (trail.length > 1) {
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const first = worldToCanvas(trail[0].x, trail[0].y);
        ctx.moveTo(first.px, first.py);
        for (let i = 1; i < trail.length; i++) {
            const p = worldToCanvas(trail[i].x, trail[i].y);
            ctx.lineTo(p.px, p.py);
        }
        ctx.stroke();
    }
    
    // Draw current ball position
    if (trail.length > 0) {
        const current = trail[trail.length - 1];
        const pos = worldToCanvas(current.x, current.y);
        
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(pos.px, pos.py, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw ball outline
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw axis labels
    ctx.fillStyle = '#555';
    ctx.font = '12px sans-serif';
    ctx.fillText('y (m)', 10, 20);
    ctx.fillText('x (m)', canvasW - 50, canvasH - 10);
}

// Render initial empty scene
function renderInitialScene() {
    render();
}

// Event listeners
playBtn.addEventListener('click', startSimulation);
resetBtn.addEventListener('click', resetSimulation);
window.addEventListener('resize', () => {
    resizeCanvasToDisplaySize();
    render();
});

// Initialize on page load
initPyodide();
