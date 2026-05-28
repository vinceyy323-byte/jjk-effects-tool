(function(){
    // 1. Setup Canvas Overlay
    const targetElement = document.getElementById("root") || document.body;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    canvas.style = "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;pointer-events:none;background:transparent;";
    targetElement.appendChild(canvas);
    window.addEventListener("resize", resize);
    resize();

    // 2. Setup Configuration Prompts
    let myName = prompt("Enter YOUR Gimkit username:") || "Player";
    let teammateName = prompt("Enter your TEAMMATE'S exact username:") || "Teammate";
    let targetName = prompt("Enter the TARGET opponent's exact username to fight:") || "Enemy";
    
    // Core Engine States
    let currentMode = "gojo"; // "gojo", "sukuna", "todo"
    let animStage = "idle";   // "idle", "cutscene", "firing", "done"
    let cutsceneTimer = 0;
    let beamX = 0, beamY = 0;
    let gojoYOffset = 0;
    let particles = [];

    // Positions discovered via DOM Scraping
    let positions = { me: null, teammate: null, target: null };

    class PixelParticle {
        constructor(x, y, vx, vy, color, size = null) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.color = color;
            this.size = size || Math.random() * 6 + 3;
            this.life = 50;
            this.maxLife = 50;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life--;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.life / this.maxLife;
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }

    // Scrapes Gimkit DOM to find screen coordinates for all 3 entities
    function locateEntities() {
        positions.me = null;
        positions.teammate = null;
        positions.target = null;

        const tags = document.querySelectorAll('div, text, span, p');
        tags.forEach(el => {
            if (!el.textContent) return;
            let text = el.textContent.trim().toLowerCase();
            let rect = el.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;

            let coords = { x: rect.left + (rect.width / 2), y: rect.top + (rect.height / 2), element: el };

            if (text === myName.toLowerCase()) positions.me = coords;
            if (text === teammateName.toLowerCase()) positions.teammate = coords;
            if (text === targetName.toLowerCase()) positions.target = coords;
        });
    }

    // --- RENDER PIXEL ART SPRITES ---
    function drawGojo(x, y, scale) {
        ctx.save(); 
        ctx.translate(x, y); 
        ctx.scale(scale, scale);
        ctx.fillStyle = "#1a1a24"; 
        ctx.fillRect(-15, 0, 30, 35); // Clothes
        ctx.fillStyle = "#ffdbac"; 
        ctx.fillRect(-12, -22, 24, 22); // Face
        ctx.fillStyle = "#ffffff"; 
        ctx.fillRect(-14, -26, 28, 8); // Hair
        ctx.fillStyle = "#000000"; 
        ctx.fillRect(-12, -14, 24, 5); // Blindfold
        ctx.restore();
    }

    // Drawing Sukuna
    function drawSukuna(x, y, scale) {
        ctx.save(); 
        ctx.translate(x, y); 
        ctx.scale(scale, scale);
        ctx.fillStyle = "#e5e0d8"; 
        ctx.fillRect(-15, 0, 30, 35); // Kimono
        ctx.fillStyle = "#ffdbac"; 
        ctx.fillRect(-12, -22, 24, 22); // Face
        ctx.fillStyle = "#ffb3d1"; 
        ctx.fillRect(-14, -26, 28, 6); // Pink spiky hair
        ctx.fillStyle = "#000000"; 
        ctx.fillRect(-6, -12, 12, 2); // Forehead markings
        ctx.restore();
    }

    // Drawing Yuji Itadori
    function drawYuji(x, y, scale) {
        ctx.save(); 
        ctx.translate(x, y); 
        ctx.scale(scale, scale);
        ctx.fillStyle = "#1a243a"; 
        ctx.fillRect(-15, 0, 30, 35); // Uniform
        ctx.fillStyle = "#ff3366"; 
        ctx.fillRect(-10, 0, 20, 6); // Red hoodie collar
        ctx.fillStyle = "#ffdbac"; 
        ctx.fillRect(-12, -22, 24, 22);
        ctx.fillStyle = "#ffb3d1"; 
        ctx.fillRect(-13, -25, 26, 6); // Spiky pink hair
        ctx.restore();
    }

    // Drawing Todo Aoi with scar
    function drawTodo(x, y, scale) {
        ctx.save(); 
        ctx.translate(x, y); 
        ctx.scale(scale, scale);
        ctx.fillStyle = "#222"; 
        ctx.fillRect(-15, 10, 30, 25); // Pants
        ctx.fillStyle = "#ffdbac"; 
        ctx.fillRect(-14, -5, 28, 15); // Shirtless torso
        ctx.fillRect(-12, -24, 24, 20); // Face
        ctx.fillStyle = "#111111"; 
        ctx.fillRect(-10, -28, 20, 6); // Top knot hair
        ctx.fillStyle = "#9c27b0"; 
        ctx.fillRect(2, -20, 3, 12); // Purple face scar
        ctx.restore();
    }

    // 3. Document Controls
    document.addEventListener("keydown", (e) => {
        const key = e.key;
        
        // Swap Modes using Numbers
        if (key === "1") { currentMode = "gojo"; animStage = "idle"; }
        if (key === "2") { currentMode = "sukuna"; animStage = "idle"; }
        if (key === "3") { currentMode = "todo"; animStage = "idle"; }

        // Trigger Ultimate Action
        if (key.toLowerCase() === "g") {
            if (currentMode === "todo") {
                // BOOGIE WOOGIE POSITION SWAP PRANK!
                locateEntities();
                if (positions.teammate && positions.target) {
                    // Play a quick simulated visual clap pulse
                    for (let i = 0; i < 30; i++) {
                        particles.push(new PixelParticle(positions.teammate.x, positions.teammate.y, (Math.random()-0.5)*15, (Math.random()-0.5)*15, "#fff200", 8));
                        particles.push(new PixelParticle(positions.target.x, positions.target.y, (Math.random()-0.5)*15, (Math.random()-0.5)*15, "#fff200", 8));
                    }
                    // Temporarily visually swap elements on your canvas layout
                    let tempTransform = positions.teammate.element.style.transform;
                    positions.teammate.element.style.transform = `translate(${positions.target.x - positions.teammate.x}px, ${positions.target.y - positions.teammate.y}px)`;
                    positions.target.element.style.transform = `translate(${positions.teammate.x - positions.target.x}px, ${positions.teammate.y - positions.target.y}px)`;
                }
            } else if (animStage === "idle") {
                animStage = "cutscene";
                cutsceneTimer = 0;
                gojoYOffset = window.innerHeight;
            }
        }

        // Reset visual state distortions
        if (key.toLowerCase() === "r") {
            animStage = "idle";
            locateEntities();
            ["me", "teammate", "target"].forEach(p => {
                if (positions[p] && positions[p].element) {
                    positions[p].element.style.opacity = "1";
                    positions[p].element.style.transform = "none";
                    positions[p].element.style.color = "";
                }
            });
        }
    }, true);

    // 4. Main Framework Render Engine Loop
    function frameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        locateEntities();

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Ambient constant mapping for Todo Mode (Transforms skin/character art styles)
        if (currentMode === "todo") {
            if (positions.me && positions.me.element) drawTodo(positions.me.x, positions.me.y - 30, 0.8);
            if (positions.teammate && positions.teammate.element) drawYuji(positions.teammate.x, positions.teammate.y - 30, 0.8);
        }

        // --- CUTSCENE SEQUENCER LAYER ---
        if (animStage === "cutscene") {
            cutsceneTimer += 1;

            // Cinema Background Bars
            ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
            ctx.fillRect(0, 0, window.innerWidth, 85);
            ctx.fillRect(0, window.innerHeight - 85, window.innerWidth, 85);

            if (gojoYOffset > centerY) gojoYOffset -= (gojoYOffset - centerY) * 0.1;

            ctx.textAlign = "center";
            ctx.font = "italic bold 30px sans-serif";

            if (currentMode === "gojo") {
                drawGojo(centerX - 150, gojoYOffset, 2.5);
                ctx.fillStyle = "#df00ff"; 
                ctx.shadowColor = "#9300d3"; 
                ctx.shadowBlur = 15;
                ctx.fillText("Throughout Heaven and Earth, I alone am the honored one.", centerX, 55);

                if (cutsceneTimer > 45) {
                    let rad = Math.max(0, 80 - (cutsceneTimer - 45) * 2);
                    ctx.fillStyle = "red"; 
                    ctx.beginPath(); 
                    ctx.arc(centerX - 150 + Math.cos(cutsceneTimer * 0.2) * rad, gojoYOffset + Math.sin(cutsceneTimer * 0.2) * rad, 10, 0, Math.PI * 2); 
                    ctx.fill();
                    ctx.fillStyle = "blue"; 
                    ctx.beginPath(); 
                    ctx.arc(centerX - 150 + Math.cos(cutsceneTimer * 0.2 + Math.PI) * rad, gojoYOffset + Math.sin(cutsceneTimer * 0.2 + Math.PI) * rad, 10, 0, Math.PI * 2); 
                    ctx.fill();
                    if (rad <= 2) { 
                        animStage = "firing"; 
                        beamX = centerX - 150; 
                        beamY = gojoYOffset; 
                    }
                }
            } 
            else if (currentMode === "sukuna") {
                drawSukuna(centerX - 150, gojoYOffset, 2.5);
                ctx.fillStyle = "#ff3300"; 
                ctx.shadowColor = "#ff6600"; 
                ctx.shadowBlur = 15;
                ctx.fillText("Open: Fuga (Divine Flame Arrow)", centerX, 55);

                // Charging fire sparks in hand
                for(let i = 0; i < 3; i++) {
                    particles.push(new PixelParticle(centerX - 120, gojoYOffset - 10, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, "#ff9900"));
                }
                if (cutsceneTimer > 50) { 
                    animStage = "firing"; 
                    beamX = centerX - 120; 
                    beamY = gojoYOffset - 10; 
                }
            }
        } 
        else if (animStage === "firing") {
            if (currentMode === "gojo") drawGojo(centerX - 150, centerY, 2.5);
            if (currentMode === "sukuna") drawSukuna(centerX - 150, centerY, 2.5);
            
            let destX = positions.target ? positions.target.x : window.innerWidth + 200;
            let destY = positions.target ? positions.target.y : centerY;
            let dx = destX - beamX; 
            let dy = destY - beamY;
            let dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 20) {
                beamX += (dx / dist) * 28; 
                beamY += (dy / dist) * 28;
                ctx.beginPath();
                if (currentMode === "gojo") {
                    ctx.fillStyle = "#9300d3"; 
                    ctx.shadowColor = "#df00ff"; 
                    ctx.shadowBlur = 40;
                    ctx.arc(beamX, beamY, 40, 0, Math.PI * 2);
                } else {
                    ctx.fillStyle = "#ff4500"; 
                    ctx.shadowColor = "#ffcc00"; 
                    ctx.shadowBlur = 40;
                    ctx.arc(beamX, beamY, 25, 0, Math.PI * 2);
                }
                ctx.fill();
            } else {
                // Direct Hit Impact!
                if (positions.target) {
                    positions.target.element.style.transition = "transform 0.4s, opacity 0.4s";
                    positions.target.element.style.transform = "scale(0) rotate(180deg)";
                    positions.target.element.style.opacity = "0";
                    let burstColor = (currentMode === "gojo") ? "#9300d3" : "#ff3300";
                    for (let p = 0; p < 70; p++) {
                        particles.push(new PixelParticle(positions.target.x, positions.target.y, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 16, burstColor));
                    }
                }
                animStage = "done";
            }
        }
        else if (animStage === "done") {
            if (positions.target && positions.target.element) positions.target.element.style.opacity = "0";
            if (particles.length === 0) animStage = "idle";
        }
        
        // Render Particle Array Stack
        ctx.shadowBlur = 0;
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].life <= 0) particles.splice(i, 1);
        }
        
        // HUD Control Layout Info
        ctx.fillStyle = "rgba(0, 255, 230, 0.85)";
        ctx.font = "bold 12px monospace"; 
        ctx.textAlign = "left";
        ctx.fillText(`GOJO | SUKUNA | TODO & YUJI | ACTIVE: ${currentMode.toUpperCase()}`, 20, window.innerHeight - 40);
        ctx.fillText(`TARGET LOCKED: ${targetName.toUpperCase()} | [G] ENGAGE ACTION | [R] RESET VISUALS`, 20, window.innerHeight - 20);
        
        requestAnimationFrame(frameLoop);
    }
    frameLoop();
})();
