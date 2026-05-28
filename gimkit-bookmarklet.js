(function(){
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    canvas.style = "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;pointer-events:auto;background:transparent;cursor:crosshair;";
    document.body.appendChild(canvas);
    window.addEventListener("resize", resize);
    resize();

    // State
    let playerCharacter = "sukuna"; // Current player character
    let playerX = window.innerWidth / 2;
    let playerY = window.innerHeight / 2;
    let targetX = window.innerWidth * 0.75;
    let targetY = window.innerHeight / 2;
    let playerHealth = 100;
    let targetHealth = 100;
    let particles = [];
    let inDomain = false;
    let domainType = null;
    let domainTimer = 0;
    let comboCount = 0;
    let lastAttackTime = 0;
    let isMoving = false;
    let moveDirection = { x: 0, y: 0 };
    let currentAbility = null;
    let abilityCharge = 0;
    let battleActive = true;

    class Particle {
        constructor(x, y, vx, vy, color, size, life = 50) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.color = color;
            this.size = size;
            this.life = life;
            this.maxLife = life;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.15;
            this.life--;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.life / this.maxLife;
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // SUKUNA - YOUR CHARACTER
    function drawSukuna(x, y, scale, opacity = 1) {
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        
        // Hair - spiky pink
        ctx.fillStyle = "#ffb3d1";
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const px = Math.cos(angle) * 14;
            const py = Math.sin(angle) * 12 - 24;
            ctx.beginPath();
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Head
        ctx.fillStyle = "#ffdbac";
        ctx.beginPath();
        ctx.ellipse(0, -12, 11, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes - demonic
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(-4, -14, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(4, -14, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Forehead markings
        ctx.fillStyle = "#ff1744";
        ctx.fillRect(-8, -18, 4, 3);
        ctx.fillRect(4, -18, 4, 3);
        
        // Body - kimono
        ctx.fillStyle = "#e5e0d8";
        ctx.fillRect(-13, 0, 26, 32);
        ctx.fillStyle = "#d4cfc0";
        ctx.fillRect(-13, 0, 26, 5);
        
        // Arms - muscular
        ctx.fillStyle = "#ffdbac";
        ctx.fillRect(-15, 5, 5, 20);
        ctx.fillRect(10, 5, 5, 20);
        
        // Aura glow
        ctx.strokeStyle = "rgba(255, 179, 209, 0.4)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 30, 35, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }

    // SUKUNA ABILITIES
    const abilities = {
        sukuna: [
            {
                name: "Slashing Technique",
                key: "q",
                cooldown: 0,
                maxCooldown: 30,
                damage: 15,
                execute: function() {
                    const angle = Math.atan2(targetY - playerY, targetX - playerX);
                    for (let i = 0; i < 20; i++) {
                        const spreadAngle = angle + (Math.random() - 0.5) * 0.5;
                        particles.push(new Particle(
                            playerX + Math.cos(angle) * 30,
                            playerY + Math.sin(angle) * 30,
                            Math.cos(spreadAngle) * 6,
                            Math.sin(spreadAngle) * 6,
                            "#ff1744",
                            5
                        ));
                    }
                }
            },
            {
                name: "Fuga - Divine Flame",
                key: "w",
                cooldown: 0,
                maxCooldown: 60,
                damage: 35,
                execute: function() {
                    const dx = targetX - playerX;
                    const dy = targetY - playerY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    for (let i = 0; i < 40; i++) {
                        const angle = (i / 40) * Math.PI * 2;
                        particles.push(new Particle(
                            playerX,
                            playerY,
                            Math.cos(angle) * 7,
                            Math.sin(angle) * 7,
                            ["#ff6600", "#ffaa00", "#ff3300"][Math.floor(Math.random() * 3)],
                            6,
                            80
                        ));
                    }
                    
                    targetHealth -= this.damage;
                    comboCount += 2;
                }
            },
            {
                name: "Shrine Domain",
                key: "e",
                cooldown: 0,
                maxCooldown: 120,
                damage: 0,
                execute: function() {
                    inDomain = true;
                    domainType = "shrine";
                    domainTimer = 180;
                    comboCount += 5;
                }
            },
            {
                name: "Dismantle",
                key: "r",
                cooldown: 0,
                maxCooldown: 45,
                damage: 25,
                execute: function() {
                    const angle = Math.atan2(targetY - playerY, targetX - playerX);
                    for (let i = 0; i < 15; i++) {
                        const speed = 5 + Math.random() * 4;
                        particles.push(new Particle(
                            playerX,
                            playerY,
                            Math.cos(angle + (Math.random() - 0.5) * 0.8) * speed,
                            Math.sin(angle + (Math.random() - 0.5) * 0.8) * speed,
                            "#ffb3d1",
                            7
                        ));
                    }
                    targetHealth -= this.damage;
                }
            }
        ]
    };

    // DOMAIN EXPANSION EFFECTS
    function drawDomain() {
        if (domainType === "shrine") {
            ctx.save();
            ctx.fillStyle = "rgba(139, 0, 139, 0.1)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Shrine barriers
            ctx.strokeStyle = "rgba(255, 100, 200, 0.5)";
            ctx.lineWidth = 3;
            
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const x1 = canvas.width / 2 + Math.cos(angle) * 200;
                const y1 = canvas.height / 2 + Math.sin(angle) * 200;
                const x2 = canvas.width / 2 + Math.cos(angle + Math.PI) * 200;
                const y2 = canvas.height / 2 + Math.sin(angle + Math.PI) * 200;
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
            
            // Center circle
            ctx.strokeStyle = "rgba(255, 50, 150, 0.7)";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, 250, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.restore();
        }
    }

    // MOVEMENT CONTROLS
    document.addEventListener("keydown", (e) => {
        const key = e.key.toLowerCase();
        
        // Movement
        if (key === "arrowup" || key === "w") moveDirection.y = -1;
        if (key === "arrowdown" || key === "s") moveDirection.y = 1;
        if (key === "arrowleft" || key === "a") moveDirection.x = -1;
        if (key === "arrowright" || key === "d") moveDirection.x = 1;
        
        // Abilities
        abilities.sukuna.forEach(ability => {
            if (key === ability.key && ability.cooldown <= 0) {
                ability.execute();
                ability.cooldown = ability.maxCooldown;
                lastAttackTime = Date.now();
            }
        });
        
        if (key === "space") {
            // Dash towards target
            const angle = Math.atan2(targetY - playerY, targetX - playerX);
            playerX += Math.cos(angle) * 80;
            playerY += Math.sin(angle) * 80;
            
            for (let i = 0; i < 30; i++) {
                const dashAngle = Math.random() * Math.PI * 2;
                particles.push(new Particle(
                    playerX,
                    playerY,
                    Math.cos(dashAngle) * 5,
                    Math.sin(dashAngle) * 5,
                    "#ffb3d1",
                    4
                ));
            }
        }
    }, true);

    document.addEventListener("keyup", (e) => {
        const key = e.key.toLowerCase();
        if (key === "arrowup" || key === "w") moveDirection.y = 0;
        if (key === "arrowdown" || key === "s") moveDirection.y = 0;
        if (key === "arrowleft" || key === "a") moveDirection.x = 0;
        if (key === "arrowright" || key === "d") moveDirection.x = 0;
    }, true);

    // MOUSE CONTROLS - Move towards click
    canvas.addEventListener("click", (e) => {
        const moveSpeed = 15;
        const dx = e.clientX - playerX;
        const dy = e.clientY - playerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 20) {
            playerX += (dx / dist) * moveSpeed;
            playerY += (dy / dist) * moveSpeed;
            
            // Trail effect
            for (let i = 0; i < 15; i++) {
                const angle = Math.random() * Math.PI * 2;
                particles.push(new Particle(
                    playerX + Math.random() * 20 - 10,
                    playerY + Math.random() * 20 - 10,
                    Math.cos(angle) * 3,
                    Math.sin(angle) * 3,
                    "#ffb3d1",
                    3
                ));
            }
        }
    });

    // GAME LOOP
    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update cooldowns
        abilities.sukuna.forEach(ability => {
            if (ability.cooldown > 0) ability.cooldown--;
        });
        
        // Player movement via keyboard
        if (moveDirection.x !== 0 || moveDirection.y !== 0) {
            const moveSpeed = 8;
            playerX += moveDirection.x * moveSpeed;
            playerY += moveDirection.y * moveSpeed;
            
            // Keep in bounds
            playerX = Math.max(50, Math.min(canvas.width - 50, playerX));
            playerY = Math.max(50, Math.min(canvas.height - 50, playerY));
        }
        
        // Domain effect
        if (inDomain) {
            drawDomain();
            domainTimer--;
            if (domainTimer <= 0) {
                inDomain = false;
                domainType = null;
            }
        }
        
        // Draw target (enemy)
        ctx.fillStyle = "#ff3300";
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw player
        drawSukuna(playerX, playerY, 1.2);
        
        // Update and draw particles
        ctx.shadowBlur = 0;
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].life <= 0) particles.splice(i, 1);
        }
        
        // HUD
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "left";
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 8;
        
        ctx.fillText(`SUKUNA - Health: ${playerHealth}`, 20, 40);
        ctx.fillText(`Enemy Health: ${Math.max(0, targetHealth)}`, 20, 65);
        ctx.fillText(`Combo: ${comboCount}x`, 20, 90);
        
        if (inDomain) {
            ctx.fillStyle = "rgba(255, 100, 200, 0.9)";
            ctx.font = "bold 20px Arial";
            ctx.fillText(`⚡ SHRINE DOMAIN ACTIVE ⚡`, canvas.width / 2 - 150, 50);
        }
        
        // Ability display
        ctx.fillStyle = "rgba(0, 200, 255, 0.9)";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "left";
        abilities.sukuna.forEach((ability, i) => {
            const cooldownText = ability.cooldown > 0 ? `[${ability.cooldown}]` : "[READY]";
            ctx.fillText(`${ability.key.toUpperCase()}: ${ability.name} ${cooldownText}`, 20, canvas.height - 100 + i * 25);
        });
        
        ctx.fillText(`SPACE: Dash | CLICK/WASD: Move | SHIFT: Sprint`, 20, canvas.height - 35);
        
        // Win condition
        if (targetHealth <= 0) {
            ctx.fillStyle = "rgba(255, 215, 0, 0.95)";
            ctx.font = "bold 40px Arial";
            ctx.textAlign = "center";
            ctx.fillText("🔥 VICTORY! 🔥", canvas.width / 2, canvas.height / 2);
            ctx.font = "bold 20px Arial";
            ctx.fillText(`Final Combo: ${comboCount}x`, canvas.width / 2, canvas.height / 2 + 50);
        }
        
        ctx.shadowBlur = 0;
        
        requestAnimationFrame(gameLoop);
    }
    
    gameLoop();
    console.log("%c🔥 SUKUNA BATTLE MODE ACTIVATED 🔥", "color: #ff1744; font-size: 18px; font-weight: bold;");
    console.log("%cQ: Slashing | W: Fuga | E: Domain | R: Dismantle | SPACE: Dash | CLICK/WASD: Move", "color: #ffb3d1; font-size: 12px;");
})();