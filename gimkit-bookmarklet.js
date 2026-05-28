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
    let playerCharacter = "sukuna";
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
    let moveDirection = { x: 0, y: 0 };
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

    // CHARACTER DRAWING FUNCTIONS
    function drawSukuna(x, y, scale, opacity = 1) {
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        
        ctx.fillStyle = "#ffb3d1";
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const px = Math.cos(angle) * 14;
            const py = Math.sin(angle) * 12 - 24;
            ctx.beginPath();
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.fillStyle = "#ffdbac";
        ctx.beginPath();
        ctx.ellipse(0, -12, 11, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(-4, -14, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(4, -14, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#ff1744";
        ctx.fillRect(-8, -18, 4, 3);
        ctx.fillRect(4, -18, 4, 3);
        
        ctx.fillStyle = "#e5e0d8";
        ctx.fillRect(-13, 0, 26, 32);
        ctx.fillStyle = "#d4cfc0";
        ctx.fillRect(-13, 0, 26, 5);
        
        ctx.fillStyle = "#ffdbac";
        ctx.fillRect(-15, 5, 5, 20);
        ctx.fillRect(10, 5, 5, 20);
        
        ctx.strokeStyle = "rgba(255, 179, 209, 0.4)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 30, 35, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }

    function drawGojo(x, y, scale, opacity = 1) {
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(-8, -22, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#ffdbac";
        ctx.beginPath();
        ctx.ellipse(0, -12, 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#000000";
        ctx.fillRect(-10, -14, 20, 4);
        ctx.fillRect(-10, -16, 3, 6);
        ctx.fillRect(7, -16, 3, 6);
        
        ctx.fillStyle = "#1a1a24";
        ctx.fillRect(-12, 0, 24, 28);
        ctx.fillStyle = "#3a3a54";
        ctx.fillRect(-12, 0, 24, 4);
        
        ctx.fillStyle = "#ffdbac";
        ctx.fillRect(-14, 4, 4, 18);
        ctx.fillRect(10, 4, 4, 18);
        
        ctx.strokeStyle = "rgba(0, 212, 255, 0.4)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 30, 35, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }

    function drawYuji(x, y, scale, opacity = 1) {
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        
        ctx.fillStyle = "#ff6b9d";
        ctx.beginPath();
        ctx.ellipse(0, -22, 10, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#ffdbac";
        ctx.beginPath();
        ctx.ellipse(0, -12, 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#ff3366";
        ctx.fillRect(-11, -8, 22, 8);
        ctx.fillRect(-12, 0, 24, 4);
        
        ctx.fillStyle = "#1a243a";
        ctx.fillRect(-12, 4, 24, 24);
        
        ctx.fillStyle = "#ffdbac";
        ctx.fillRect(-14, 6, 4, 18);
        ctx.fillRect(10, 6, 4, 18);
        
        ctx.strokeStyle = "rgba(255, 107, 157, 0.4)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 30, 35, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }

    function drawTodo(x, y, scale, opacity = 1) {
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.ellipse(0, -24, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#ffdbac";
        ctx.beginPath();
        ctx.ellipse(0, -10, 11, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#9c27b0";
        ctx.beginPath();
        ctx.moveTo(6, -18);
        ctx.lineTo(8, -8);
        ctx.lineTo(7, -8);
        ctx.lineTo(5, -18);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = "#ffdbac";
        ctx.fillRect(-10, 0, 20, 14);
        
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
        
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(-11, 14, 22, 14);
        
        ctx.fillStyle = "#ffdbac";
        ctx.fillRect(-13, 4, 4, 18);
        ctx.fillRect(9, 4, 4, 18);
        
        ctx.strokeStyle = "rgba(156, 39, 176, 0.4)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 30, 35, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }

    // ABILITIES FOR EACH CHARACTER
    const abilities = {
        sukuna: [
            { name: "Slashing", key: "q", cooldown: 0, maxCooldown: 30, damage: 15, color: "#ff1744" },
            { name: "Fuga", key: "w", cooldown: 0, maxCooldown: 60, damage: 35, color: "#ff6600" },
            { name: "Domain", key: "e", cooldown: 0, maxCooldown: 120, damage: 0, color: "#ff1493" },
            { name: "Dismantle", key: "r", cooldown: 0, maxCooldown: 45, damage: 25, color: "#ffb3d1" }
        ],
        gojo: [
            { name: "Limitless", key: "q", cooldown: 0, maxCooldown: 35, damage: 20, color: "#00ffff" },
            { name: "Infinity Void", key: "w", cooldown: 0, maxCooldown: 65, damage: 40, color: "#0088ff" },
            { name: "Blue Domain", key: "e", cooldown: 0, maxCooldown: 130, damage: 0, color: "#00d4ff" },
            { name: "Red Technique", key: "r", cooldown: 0, maxCooldown: 50, damage: 30, color: "#ff3300" }
        ],
        yuji: [
            { name: "Martial Arts", key: "q", cooldown: 0, maxCooldown: 25, damage: 18, color: "#ff6b9d" },
            { name: "Sukuna Slash", key: "w", cooldown: 0, maxCooldown: 55, damage: 32, color: "#ff1744" },
            { name: "Vessel Domain", key: "e", cooldown: 0, maxCooldown: 100, damage: 0, color: "#ff69b4" },
            { name: "Black Flash", key: "r", cooldown: 0, maxCooldown: 70, damage: 45, color: "#000000" }
        ],
        todo: [
            { name: "Kick", key: "q", cooldown: 0, maxCooldown: 28, damage: 17, color: "#9c27b0" },
            { name: "Boogie Woogie", key: "w", cooldown: 0, maxCooldown: 80, damage: 0, color: "#ffff00" },
            { name: "Purple Domain", key: "e", cooldown: 0, maxCooldown: 140, damage: 0, color: "#9c27b0" },
            { name: "Ultimate Punch", key: "r", cooldown: 0, maxCooldown: 60, damage: 38, color: "#6a1b9a" }
        ]
    };

    // DOMAIN EFFECTS
    function drawDomain() {
        if (domainType === "shrine") {
            ctx.save();
            ctx.fillStyle = "rgba(139, 0, 139, 0.1)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
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
            ctx.strokeStyle = "rgba(255, 50, 150, 0.7)";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, 250, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        } else if (domainType === "gojo") {
            ctx.save();
            ctx.fillStyle = "rgba(0, 136, 255, 0.08)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = "rgba(0, 212, 255, 0.4)";
            ctx.lineWidth = 3;
            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2;
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, 150 + i * 20, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        } else if (domainType === "yuji") {
            ctx.save();
            ctx.fillStyle = "rgba(255, 107, 157, 0.1)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = "rgba(255, 69, 180, 0.5)";
            ctx.lineWidth = 3;
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, 120 + i * 30, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        } else if (domainType === "todo") {
            ctx.save();
            ctx.fillStyle = "rgba(156, 39, 176, 0.08)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = "rgba(156, 39, 176, 0.5)";
            ctx.lineWidth = 3;
            for (let i = 0; i < 10; i++) {
                const angle = (i / 10) * Math.PI * 2;
                const x1 = canvas.width / 2 + Math.cos(angle) * 200;
                const y1 = canvas.height / 2 + Math.sin(angle) * 200;
                const x2 = canvas.width / 2 + Math.cos(angle + Math.PI / 10) * 180;
                const y2 = canvas.height / 2 + Math.sin(angle + Math.PI / 10) * 180;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    // ABILITY EXECUTION
    function executeAbility(char, abilityIndex) {
        const ability = abilities[char][abilityIndex];
        const angle = Math.atan2(targetY - playerY, targetX - playerX);

        if (ability.name === "Domain") {
            inDomain = true;
            domainType = char === "sukuna" ? "shrine" : char === "gojo" ? "gojo" : char === "yuji" ? "yuji" : "todo";
            domainTimer = 200;
        } else {
            for (let i = 0; i < 30; i++) {
                particles.push(new Particle(
                    playerX + Math.cos(angle) * 30,
                    playerY + Math.sin(angle) * 30,
                    Math.cos(angle + (Math.random() - 0.5) * 0.6) * (5 + Math.random() * 4),
                    Math.sin(angle + (Math.random() - 0.5) * 0.6) * (5 + Math.random() * 4),
                    ability.color,
                    5
                ));
            }
            targetHealth -= ability.damage;
            comboCount += Math.ceil(ability.damage / 10);
        }
    }

    // KEYBOARD CONTROLS
    document.addEventListener("keydown", (e) => {
        const key = e.key.toLowerCase();
        
        if (key === "1") playerCharacter = "sukuna";
        if (key === "2") playerCharacter = "gojo";
        if (key === "3") playerCharacter = "yuji";
        if (key === "4") playerCharacter = "todo";
        
        if (key === "arrowup" || key === "w") moveDirection.y = -1;
        if (key === "arrowdown" || key === "s") moveDirection.y = 1;
        if (key === "arrowleft" || key === "a") moveDirection.x = -1;
        if (key === "arrowright" || key === "d") moveDirection.x = 1;
        
        abilities[playerCharacter].forEach((ability, i) => {
            if (key === ability.key && ability.cooldown <= 0) {
                executeAbility(playerCharacter, i);
                ability.cooldown = ability.maxCooldown;
            }
        });
        
        if (key === " ") {
            const angle = Math.atan2(targetY - playerY, targetX - playerX);
            playerX += Math.cos(angle) * 80;
            playerY += Math.sin(angle) * 80;
            for (let i = 0; i < 30; i++) {
                particles.push(new Particle(playerX + Math.random() * 20 - 10, playerY + Math.random() * 20 - 10, Math.random() * 6 - 3, Math.random() * 6 - 3, "#ffffff", 4));
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

    canvas.addEventListener("click", (e) => {
        const moveSpeed = 15;
        const dx = e.clientX - playerX;
        const dy = e.clientY - playerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 20) {
            playerX += (dx / dist) * moveSpeed;
            playerY += (dy / dist) * moveSpeed;
            for (let i = 0; i < 15; i++) {
                particles.push(new Particle(playerX + Math.random() * 20 - 10, playerY + Math.random() * 20 - 10, Math.cos(Math.random() * Math.PI * 2) * 3, Math.sin(Math.random() * Math.PI * 2) * 3, "#ffffff", 3));
            }
        }
    });

    // MAIN GAME LOOP
    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        abilities[playerCharacter].forEach(ability => {
            if (ability.cooldown > 0) ability.cooldown--;
        });
        
        if (moveDirection.x !== 0 || moveDirection.y !== 0) {
            const moveSpeed = 8;
            playerX += moveDirection.x * moveSpeed;
            playerY += moveDirection.y * moveSpeed;
            playerX = Math.max(50, Math.min(canvas.width - 50, playerX));
            playerY = Math.max(50, Math.min(canvas.height - 50, playerY));
        }
        
        if (inDomain) {
            drawDomain();
            domainTimer--;
            if (domainTimer <= 0) {
                inDomain = false;
                domainType = null;
            }
        }
        
        ctx.fillStyle = "#ff3300";
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 25, 0, Math.PI * 2);
        ctx.fill();
        
        if (playerCharacter === "sukuna") drawSukuna(playerX, playerY, 1.2);
        else if (playerCharacter === "gojo") drawGojo(playerX, playerY, 1.2);
        else if (playerCharacter === "yuji") drawYuji(playerX, playerY, 1.2);
        else if (playerCharacter === "todo") drawTodo(playerX, playerY, 1.2);
        
        ctx.shadowBlur = 0;
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].life <= 0) particles.splice(i, 1);
        }
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "left";
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 8;
        
        ctx.fillText(`${playerCharacter.toUpperCase()} - Health: ${playerHealth}`, 20, 40);
        ctx.fillText(`Enemy Health: ${Math.max(0, targetHealth)}`, 20, 65);
        ctx.fillText(`Combo: ${comboCount}x`, 20, 90);
        
        if (inDomain) {
            ctx.fillStyle = "rgba(255, 100, 200, 0.9)";
            ctx.font = "bold 18px Arial";
            const domainNames = { shrine: "SHRINE DOMAIN", gojo: "BLUE DOMAIN", yuji: "VESSEL DOMAIN", todo: "PURPLE DOMAIN" };
            ctx.fillText(`⚡ ${domainNames[domainType]} ⚡`, canvas.width / 2 - 150, 50);
        }
        
        ctx.fillStyle = "rgba(0, 200, 255, 0.9)";
        ctx.font = "bold 12px monospace";
        abilities[playerCharacter].forEach((ability, i) => {
            const cooldownText = ability.cooldown > 0 ? `[${ability.cooldown}]` : "[READY]";
            ctx.fillText(`${ability.key.toUpperCase()}: ${ability.name} ${cooldownText}`, 20, canvas.height - 100 + i * 25);
        });
        
        ctx.fillText(`[1]SUKUNA [2]GOJO [3]YUJI [4]TODO | SPACE: Dash | CLICK/WASD: Move`, 20, canvas.height - 35);
        
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
    console.log("%c🔥 JJK BATTLE ARENA 🔥", "color: #ff1744; font-size: 18px; font-weight: bold;");
    console.log("%c[1]SUKUNA [2]GOJO [3]YUJI [4]TODO | Q/W/E/R Abilities | SPACE: Dash | WASD/CLICK: Move", "color: #ffb3d1; font-size: 12px;");
})();