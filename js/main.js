// Main Application Controller
class JJKEffectsTool {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('effectCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // State
        this.currentMode = 'gojo';
        this.gojoMode = 'blue'; // blue or red
        this.mousePos = { x: 0, y: 0 };
        this.effects = [];
        
        // Settings
        this.settings = {
            particleSize: 20,
            animationSpeed: 1,
            intensity: 0.7,
            glow: true,
            trail: true,
            pulse: true
        };

        // Performance
        this.frameCount = 0;
        this.lastFpsTime = Date.now();
        this.fps = 60;

        // Initialize event listeners
        this.initEventListeners();
        this.initUI();
        
        // Start animation loop
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initEventListeners() {
        // Mouse tracking
        window.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
        });

        // Click to spawn effect
        window.addEventListener('click', (e) => {
            this.spawnEffect(e.clientX, e.clientY);
        });

        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            
            switch(key) {
                case 'y':
                    this.gojoMode = this.gojoMode === 'blue' ? 'red' : 'blue';
                    this.updateModeDisplay();
                    break;
                case 'p':
                    this.currentMode = 'purple';
                    this.updateModeDisplay();
                    break;
                case 's':
                    this.currentMode = 'sukuna';
                    this.updateModeDisplay();
                    break;
                case 'm':
                    this.currentMode = 'mahoraga';
                    this.updateModeDisplay();
                    break;
                case 'b':
                    this.currentMode = 'blackflash';
                    this.updateModeDisplay();
                    break;
                case 'f':
                    this.currentMode = 'fuga';
                    this.updateModeDisplay();
                    break;
                case 't':
                    this.currentMode = 'todo';
                    this.updateModeDisplay();
                    break;
            }
        });
    }

    initUI() {
        // Mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.currentMode = mode;
                this.updateModeDisplay();
                this.updateActiveButton();
            });
        });

        // Sliders
        document.getElementById('sizeSlider').addEventListener('input', (e) => {
            this.settings.particleSize = parseFloat(e.target.value);
            document.getElementById('sizeValue').textContent = e.target.value;
        });

        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.settings.animationSpeed = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = e.target.value + 'x';
        });

        document.getElementById('intensitySlider').addEventListener('input', (e) => {
            this.settings.intensity = parseFloat(e.target.value);
            document.getElementById('intensityValue').textContent = e.target.value;
        });

        // Checkboxes
        document.getElementById('glowEffect').addEventListener('change', (e) => {
            this.settings.glow = e.target.checked;
        });

        document.getElementById('trailEffect').addEventListener('change', (e) => {
            this.settings.trail = e.target.checked;
        });

        document.getElementById('pulseEffect').addEventListener('change', (e) => {
            this.settings.pulse = e.target.checked;
        });

        this.updateActiveButton();
    }

    updateModeDisplay() {
        const modeNames = {
            'gojo': this.gojoMode === 'blue' ? 'Gojo Blue' : 'Gojo Red',
            'purple': 'Purple',
            'sukuna': 'Sukuna',
            'mahoraga': 'Mahoraga',
            'blackflash': 'Blackflash',
            'fuga': 'Fuga',
            'todo': 'Todo'
        };

        document.getElementById('currentMode').textContent = modeNames[this.currentMode] || 'Unknown';
        this.updateActiveButton();
    }

    updateActiveButton() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === this.currentMode) {
                btn.classList.add('active');
            }
        });
    }

    spawnEffect(x, y) {
        const size = this.settings.particleSize;
        const intensity = this.settings.intensity;
        let effect;

        switch(this.currentMode) {
            case 'gojo':
                effect = this.gojoMode === 'blue' 
                    ? new Effects.GojoBlue(x, y, size, intensity)
                    : new Effects.GojoRed(x, y, size, intensity);
                break;
            case 'purple':
                effect = new Effects.PurpleEffect(x, y, size * 1.2, intensity);
                break;
            case 'sukuna':
                effect = new Effects.SukunaEffect(x, y, size, intensity);
                break;
            case 'mahoraga':
                effect = new Effects.MahoragaEffect(x, y, size, intensity);
                break;
            case 'blackflash':
                effect = new Effects.BlackflashEffect(x, y, size, intensity);
                break;
            case 'fuga':
                effect = new Effects.FugaEffect(x, y, size * 0.8, intensity);
                break;
            case 'todo':
                effect = new Effects.TodoEffect(x, y, size, intensity);
                break;
            default:
                effect = new Effects.GojoBlue(x, y, size, intensity);
        }

        if (effect) {
            this.effects.push(effect);
        }
    }

    update() {
        // Update all effects
        this.effects.forEach(effect => effect.update());
        
        // Remove dead effects
        this.effects = this.effects.filter(effect => !effect.isDone());

        // Update FPS counter
        this.frameCount++;
        const now = Date.now();
        if (now - this.lastFpsTime >= 1000) {
            this.fps = this.frameCount;
            document.getElementById('fps').textContent = this.fps;
            this.frameCount = 0;
            this.lastFpsTime = now;
        }
    }

    draw() {
        // Clear canvas with fade trail if enabled
        if (this.settings.trail) {
            this.ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
        } else {
            this.ctx.fillStyle = 'rgba(10, 14, 39, 1)';
        }
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, 'rgba(10, 14, 39, 0.3)');
        gradient.addColorStop(0.5, 'rgba(26, 26, 62, 0.2)');
        gradient.addColorStop(1, 'rgba(10, 14, 39, 0.3)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw all effects
        this.effects.forEach(effect => effect.draw(this.ctx));

        // Draw cursor indicator
        this.drawCursor();
    }

    drawCursor() {
        const x = this.mousePos.x;
        const y = this.mousePos.y;
        const size = this.settings.particleSize;

        this.ctx.save();
        
        // Cursor circle
        this.ctx.strokeStyle = 'rgba(0, 255, 200, 0.4)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        this.ctx.stroke();

        // Crosshair
        this.ctx.strokeStyle = 'rgba(0, 255, 200, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x - size * 0.3, y);
        this.ctx.lineTo(x + size * 0.3, y);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(x, y - size * 0.3);
        this.ctx.lineTo(x, y + size * 0.3);
        this.ctx.stroke();

        this.ctx.restore();
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    new JJKEffectsTool();
});
