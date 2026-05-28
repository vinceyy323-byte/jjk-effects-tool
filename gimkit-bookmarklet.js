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
    let currentMode = "gojo"; // "gojo", "sukuna", "todo", "yuji"
    let animStage = "idle";   // "idle", "cutscene", "firing", "done"
    let cutsceneTimer = 0;
    let beamX = 0, beamY = 0;
    let gojoYOffset = 0;
    let particles = [];
    let boogieCooldown = 0;

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

        const tags = document.querySelectorAll('div, text, span, p, h1, h2, h3');
        tags.forEach(el => {
            if (!el.textContent) return;
            let text = el.textContent.trim().toLowerCase();
            let rect = el.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;

            let coords = { x: rect.left + (rect.width / 2), y: rect.top + (rect.height / 2), element: el };

            if (text.includes(myName.toLowerCase())) positions.me = coords;
            if (text.includes(teammateName.toLowerCase())) positions.teammate = coords;
            if (text.includes(targetName.toLowerCase())) positions.target = coords;
        });
    }

    // --- IMPROVED PIXEL ART SPRITES ---
    function drawGojo(x, y, scale) {
        ctx.save(); 
        ctx.translate(x, y); 
        ctx.scale(scale, scale);
        
        // Hair
        ctx.fillStyle = "#ffffff"; 
        ctx.beginPath();
        ctx.ellipse(-8, -22, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = "#ffdbac"; 
        ctx.beginPath();
        ctx.ellipse(0, -12, 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Blindfold
        ctx.fillStyle = "#000000"; 
        ctx.fillRect(-10, -14, 20, 4);
        ctx.fillRect(-10, -16, 3, 6);
        ctx.fillRect(7, -16, 3, 6);
        
        // Body
        ctx.fillStyle = "#1a1a24"; 
        ctx.fillRect(-12, 0, 24, 28);
        
        // Shirt details
        ctx.fillStyle = "#3a3a54";
        ctx.fillRect(-12, 0, 24, 4);
        
        // Arms
        ctx.fillStyle = "#ffdbac";
        ctx.fillRect(-14, 4, 4, 18);
        ctx.fillRect(10, 4, 4, 18);
        
        ctx.restore();
    }

    // Drawing Sukuna - Improved
    function drawSukuna(x, y, scale) {
        ctx.save(); 
        ctx.translate(x, y); 
        ctx.scale(scale, scale);
        
        // Hair
        ctx.fillStyle = "#ffb3d1"; 
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
            const px = Math.cos(angle) * 12;
            const py = Math.sin(angle) * 10 - 22;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        
        // Head
        ctx.fillStyle = "#ffdbac"; 
        ctx.beginPath();
        ctx.ellipse(0, -12, 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Forehead markings
        ctx.fillStyle = "#000000"; 
        ctx.fillRect(-8, -14, 4, 2);
        ctx.fillRect(4, -14, 4, 2);
        
        // Body/Kimono
        ctx.fillStyle = "#e5e0d8"; 
        ctx.fillRect(-12, 0, 24, 28);
        ctx.fillStyle = "#d4cfc0";
        ctx.fillRect(-12, 0, 24, 4);
        
        // Arms
        ctx.fillStyle = "#ffdbac";
        ctx.fillRect(-14, 4, 4, 18);
        ctx.fillRect(10, 4, 4, 18);
        
        ctx.restore();
    }

    // Drawing Yuji - Improved
    function drawYuji(x, y, scale) {
        ctx.save(); 
        ctx.translate(x, y); 
        ctx.scale(scale, scale);
        
        // Hair
        ctx.fillStyle = "#ff6b9d"; 
        ctx.beginPath();
        ctx.ellipse(0, -22, 10, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = "#ffdbac"; 
        ctx.beginPath();
        ctx.ellipse(0, -12, 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Hoodie top
        ctx.fillStyle = "#ff3366"; 
        ctx.fillRect(-11, -8, 22, 8);
        ctx.fillRect(-12, 0, 24, 4);
        
        // Body
        ctx.fillStyle = "#1a243a"; 
        ctx.fillRect(-12, 4, 24, 24);
        
        // Arms
        ctx.fillStyle = "#ffdbac";
        ctx.fillRect(-14, 6, 4, 18);
        ctx.fillRect(10, 6, 4, 18);
        
        ctx.restore();
    }

    // Drawing Todo Aoi - Improved
    function drawTodo(x, y, scale) {
        ctx.save(); 
        ctx.translate(x, y); 
        ctx.scale(scale, scale);
        
        // Hair/Top knot
        ctx.fillStyle = "#1a1a1a"; 
        ctx.beginPath();
        ctx.ellipse(0, -24, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = "#ffdbac"; 
        ctx.beginPath();
        ctx.ellipse(0, -10, 11, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Face scar (purple)
        ctx.fillStyle = "#9c27b0";
        ctx.beginPath();
        ctx.moveTo(6, -18);
        ctx.lineTo(8, -8);
        ctx.lineTo(7, -8);
        ctx.lineTo(5, -18);
        ctx.closePath();
        ctx.fill();
        
        // Torso (shirtless)
        ctx.fillStyle = "#ffdbac";
        ctx.fillRect(-10, 0, 20, 14);
        
        // Muscles definition
        ctx.strokeStyle = "#ffb380";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-2, 0);
        ctx.lineTo(-2, 14);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(2, 0);
        ctx.lineTo(2, 14);
        ctx.stroke();
        
        // Pants
        ctx.fillStyle = "#1a1a1a"; 
        ctx.fillRect(-11, 14, 22, 14);
        
        // Arms
        ctx.fillStyle = "#ffdbac";
        ctx.fillRect(-13, 4, 4, 18);
        ctx.fillRect(9, 4, 4, 18);
        
        ctx.restore();
    }

    // 3. Document Controls
    document.addEventListener("keydown", (e) => {
        const key = e.key;
        
        // Swap Modes using Numbers
        if (key === "1") { currentMode = "gojo"; animStage = "idle"; }
        if (key === "2") { currentMode = "sukuna"; animStage = "idle"; }
        if (key === "3") { currentMode = "todo"; animStage = "idle"; }
        if (key === "4") { currentMode = "yuji"; animStage = "idle"; }

        // Trigger Ultimate Action
        if (key.toLowerCase() === "g") {
            if (currentMode === "todo" && boogieCooldown <= 0) {
                // BOOGIE WOOGIE POSITION SWAP!
                locateEntities();
                if (positions.teammate && positions.target) {
                    boogieCooldown = 120;
                    
                    // Create clapping effect
                    for (let i = 0; i < 50; i++) {
                        const angle = (Math.random() * Math.PI * 2);
                        const speed = 3 + Math.random() * 5;
                        particles.push(new PixelParticle(
                            (positions.teammate.x + positions.target.x) / 2,
                            (positions.teammate.y + positions.target.y) / 2,
                            Math.cos(angle) * speed,
                            Math.sin(angle) * speed,
                            "#ffff00",
                            8
                        ));
                    }
                    
                    // Swap positions
                    const tempX = positions.teammate.x;
                    const tempY = positions.teammate.y;
                    positions.teammate.x = positions.target.x;
                    positions.teammate.y = positions.target.y;
                    positions.target.x = tempX;
                    positions.target.y = tempY;
                }
            } else if (currentMode === "yuji" && animStage === "idle") {
                // Yuji Sukuna Domain Expansion
                animStage = "cutscene";
                cutsceneTimer = 0;
                gojoYOffset = window.innerHeight;
            } else if (animStage === "idle") {
                animStage = "cutscene";
                cutsceneTimer = 0;
                gojoYOffset = window.innerHeight;
            }
        }

        // Reset visual state distortions
        if (key.toLowerCase() === "r") {
            animStage = "idle";
            boogieCooldown = 0;
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
        
        if (boogieCooldown > 0) boogieCooldown--;

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Draw character overlays on player positions
        if (currentMode === "todo") {
            if (positions.me && positions.me.element) drawTodo(positions.me.x, positions.me.y - 35, 0.7);
            if (positions.teammate && positions.teammate.element) drawYuji(positions.teammate.x, positions.teammate.y - 35, 0.7);
        } else if (currentMode === "yuji") {
            if (positions.me && positions.me.element) drawYuji(positions.me.x, positions.me.y - 35, 0.7);
            if (positions.teammate && positions.teammate.element) drawYuji(positions.teammate.x, positions.teammate.y - 35, 0.7);
        } else if (currentMode === "gojo") {
            if (positions.me && positions.me.element) drawGojo(positions.me.x, positions.me.y - 35, 0.7);
        } else if (currentMode === "sukuna") {
            if (positions.me && positions.me.element) drawSukuna(positions.me.x, positions.me.y - 35, 0.7);
        }

        // --- CUTSCENE SEQUENCER LAYER ---
        if (animStage === "cutscene") {
            cutsceneTimer += 1;

            // Cinema Background Bars
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.fillRect(0, 0, window.innerWidth, 90);
            ctx.fillRect(0, window.innerHeight - 90, window.innerWidth, 90);

            if (gojoYOffset > centerY) gojoYOffset -= (gojoYOffset - centerY) * 0.12;

            ctx.textAlign = "center";
            ctx.font = "italic bold 28px sans-serif";

            if (currentMode === "gojo") {
                drawGojo(centerX - 200, gojoYOffset, 3.5);
                ctx.fillStyle = "#00ffff"; 
                ctx.shadowColor = "#0088ff"; 
                ctx.shadowBlur = 20;
                ctx.fillText("∞ Limitless Void ∞", centerX, 50);

                if (cutsceneTimer > 50) {
                    let rad = Math.max(0, 100 - (cutsceneTimer - 50) * 3);
                    
                    // Infinity circles
                    ctx.strokeStyle = "#00ffff";
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(centerX - 200, gojoYOffset, rad, 0, Math.PI * 2);
                    ctx.stroke();
                    
                    ctx.strokeStyle = "#00aaff";
                    ctx.beginPath();
                    ctx.arc(centerX - 200, gojoYOffset, rad * 0.7, 0, Math.PI * 2);
                    ctx.stroke();
                    
                    if (rad <= 5) { 
                        animStage = "firing"; 
                        beamX = centerX - 200; 
                        beamY = gojoYOffset; 
                    }
                }
            } 
            else if (currentMode === "sukuna") {
                drawSukuna(centerX - 200, gojoYOffset, 3.5);
                ctx.fillStyle = "#ff6600"; 
                ctx.shadowColor = "#ff3300"; 
                ctx.shadowBlur = 20;
                ctx.fillText("🔥 Fuga: Divine Flame 🔥", centerX, 50);

                // Charging fire
                for(let i = 0; i < 4; i++) {
                    particles.push(new PixelParticle(
                        centerX - 180 + Math.random() * 40,
                        gojoYOffset - 20,
                        (Math.random() - 0.5) * 8,
                        (Math.random() - 2) * 8,
                        ["#ff6600", "#ffaa00", "#ff3300"][Math.floor(Math.random() * 3)],
                        6
                    ));
                }
                if (cutsceneTimer > 55) { 
                    animStage = "firing"; 
                    beamX = centerX - 200; 
                    beamY = gojoYOffset; 
                }
            }
            else if (currentMode === "yuji") {
                drawYuji(centerX - 200, gojoYOffset, 3.5);
                ctx.fillStyle = "#ff1493"; 
                ctx.shadowColor = "#ff69b4"; 
                ctx.shadowBlur = 20;
                ctx.fillText("⚡ Sukuna's Vessel ⚡", centerX, 50);

                if (cutsceneTimer > 45) {
                    animStage = "firing";
                    beamX = centerX - 200;
                    beamY = gojoYOffset;
                }
            }
        } 
        else if (animStage === "firing") {
            if (currentMode === "gojo") drawGojo(centerX - 200, centerY, 3.5);
            if (currentMode === "sukuna") drawSukuna(centerX - 200, centerY, 3.5);
            if (currentMode === "yuji") drawYuji(centerX - 200, centerY, 3.5);
            
            let destX = positions.target ? positions.target.x : window.innerWidth + 200;
            let destY = positions.target ? positions.target.y : centerY;
            let dx = destX - beamX; 
            let dy = destY - beamY;
            let dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 20) {
                beamX += (dx / dist) * 32; 
                beamY += (dy / dist) * 32;
                
                // Draw beam effect
                if (currentMode === "gojo") {
                    ctx.fillStyle = "#00ffff";
                    ctx.shadowColor = "#0088ff";
                    ctx.shadowBlur = 50;
                    for (let i = 0; i < 3; i++) {
                        ctx.globalAlpha = 0.6 - i * 0.15;
                        ctx.beginPath();
                        ctx.arc(beamX, beamY, 50 - i * 10, 0, Math.PI * 2);
                        ctx.fill();
                    }
                } else if (currentMode === "sukuna") {
                    ctx.fillStyle = "#ff6600";
                    ctx.shadowColor = "#ff3300";
                    ctx.shadowBlur = 60;
                    for (let i = 0; i < 4; i++) {
                        ctx.globalAlpha = 0.7 - i * 0.15;
                        ctx.beginPath();
                        ctx.arc(beamX + Math.sin(cutsceneTimer + i) * 15, beamY + Math.cos(cutsceneTimer + i) * 15, 35 - i * 8, 0, Math.PI * 2);
                        ctx.fill();
                    }
                } else if (currentMode === "yuji") {
                    ctx.fillStyle = "#ff1493";
                    ctx.shadowColor = "#ff69b4";
                    ctx.shadowBlur = 45;
                    ctx.globalAlpha = 0.8;
                    ctx.beginPath();
                    ctx.arc(beamX, beamY, 35, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = 1;
            } else {
                // Direct Hit Impact!
                if (positions.target) {
                    positions.target.element.style.transition = "transform 0.5s, opacity 0.5s";
                    positions.target.element.style.transform = "scale(0.3) rotate(360deg)";
                    positions.target.element.style.opacity = "0";
                    
                    let burstColor = (currentMode === "gojo") ? "#00ffff" : (currentMode === "sukuna") ? "#ff6600" : "#ff1493";
                    for (let p = 0; p < 100; p++) {
                        const angle = (p / 100) * Math.PI * 2;
                        particles.push(new PixelParticle(
                            positions.target.x,
                            positions.target.y,
                            Math.cos(angle) * (3 + Math.random() * 8),
                            Math.sin(angle) * (3 + Math.random() * 8),
                            burstColor,
                            4 + Math.random() * 4
                        ));
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
        ctx.globalAlpha = 1;
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].life <= 0) particles.splice(i, 1);
        }
        
        ctx.globalAlpha = 1;
        
        // HUD Control Layout Info
        ctx.fillStyle = "rgba(0, 255, 230, 0.9)";
        ctx.font = "bold 13px monospace"; 
        ctx.textAlign = "left";
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText(`[1]GOJO [2]SUKUNA [3]TODO [4]YUJI | MODE: ${currentMode.toUpperCase()}`, 20, window.innerHeight - 40);
        ctx.fillText(`[G] ATTACK | [R] RESET | TARGET: ${targetName.toUpperCase()}${boogieCooldown > 0 ? ` (Boogie: ${Math.ceil(boogieCooldown/60)}s)` : ''}`, 20, window.innerHeight - 20);
        ctx.shadowBlur = 0;
        
        requestAnimationFrame(frameLoop);
    }
    frameLoop();
})();