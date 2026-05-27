// JJK Effects for Gimkit - Multiplayer Edition
// Works on gimkit.com and shows effects to ALL players in the game
// Paste in browser console while on a Gimkit game

javascript:(function(){
  // Create shared canvas overlay
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  canvas.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;pointer-events:none;';
  document.body.appendChild(canvas);
  window.onresize = resizeCanvas;
  resizeCanvas();
  
  // State
  let mousePos = { x: 0, y: 0 };
  let currentMode = 'gojo';
  let gojoMode = 'blue';
  let particleSize = 25;
  let intensity = 0.8;
  let effects = [];
  let isActive = false;
  
  // WebSocket for multiplayer (fallback to local if no connection)
  let effectsQueue = [];
  
  // Mouse tracking
  document.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
  }, true);
  
  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'y') gojoMode = gojoMode === 'blue' ? 'red' : 'blue';
    if (key === 'p') currentMode = 'purple';
    if (key === 's') currentMode = 'sukuna';
    if (key === 'm') currentMode = 'mahoraga';
    if (key === 'b') currentMode = 'blackflash';
    if (key === 'f') currentMode = 'fuga';
    if (key === 't') currentMode = 'todo';
    if (key === 'h') isActive = !isActive; // Toggle on/off
  }, true);
  
  // Click to spawn effects
  document.addEventListener('click', (e) => {
    if (isActive) {
      spawnEffect(e.clientX, e.clientY);
    }
  }, true);
  
  // Particle class
  class Particle {
    constructor(x, y, vx, vy, color, size) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.color = color;
      this.size = size;
      this.life = 70;
      this.maxLife = 70;
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.2;
      this.life--;
    }
    
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.life / this.maxLife;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    isDead() {
      return this.life <= 0;
    }
  }
  
  // Effect classes - Enhanced for visibility
  class GojoBlueEffect {
    constructor(x, y, size) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.age = 0;
      this.maxAge = 70;
      this.particles = [];
      this.rotation = 0;
      
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const speed = 2.5 + Math.random() * 2.5;
        this.particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, '#00d4ff', size * 0.9));
      }
    }
    
    update() {
      this.rotation += 0.08;
      this.age++;
      this.particles.forEach(p => p.update());
      this.particles = this.particles.filter(p => !p.isDead());
    }
    
    draw(ctx) {
      ctx.save();
      const alpha = Math.max(0, 1 - this.age / this.maxAge);
      
      // Core glow
      ctx.fillStyle = `rgba(0, 212, 255, ${0.5 * alpha})`;
      ctx.shadowBlur = 40 * intensity;
      ctx.shadowColor = '#00d4ff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Rotating rings
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      
      ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = alpha * (1 - i / 3);
        ctx.beginPath();
        ctx.arc(0, 0, this.size * (0.5 + i * 0.25), 0, Math.PI * 2);
        ctx.stroke();
      }
      
      ctx.restore();
      this.particles.forEach(p => p.draw(ctx));
    }
    
    isDone() {
      return this.age >= this.maxAge && this.particles.length === 0;
    }
  }
  
  class GojoRedEffect {
    constructor(x, y, size) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.age = 0;
      this.maxAge = 60;
      this.expansion = 0;
      this.particles = [];
      
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        this.particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, '#ff1744', size * 0.7));
      }
    }
    
    update() {
      this.expansion += 0.3;
      this.age++;
      this.particles.forEach(p => {
        p.update();
        const dist = Math.hypot(p.x - this.x, p.y - this.y);
        if (dist > 0) {
          p.vx += ((p.x - this.x) / dist) * 0.15;
          p.vy += ((p.y - this.y) / dist) * 0.15;
        }
      });
      this.particles = this.particles.filter(p => !p.isDead());
    }
    
    draw(ctx) {
      ctx.save();
      const alpha = Math.max(0, 1 - this.age / this.maxAge);
      
      ctx.fillStyle = `rgba(255, 23, 68, ${0.4 * alpha})`;
      ctx.shadowBlur = 50 * intensity;
      ctx.shadowColor = '#ff1744';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size + this.expansion, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#ff1744';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.restore();
      this.particles.forEach(p => p.draw(ctx));
    }
    
    isDone() {
      return this.age >= this.maxAge && this.particles.length === 0;
    }
  }
  
  class SukunaEffect {
    constructor(x, y, size) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.age = 0;
      this.maxAge = 90;
      this.rotation = 0;
      this.particles = [];
      
      for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.5 + Math.random() * 3.5;
        this.particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, '#ffff99', size * 0.6));
      }
    }
    
    update() {
      this.rotation += 0.2;
      this.age++;
      this.particles.forEach(p => p.update());
      this.particles = this.particles.filter(p => !p.isDead());
    }
    
    draw(ctx) {
      ctx.save();
      const alpha = Math.max(0, 1 - this.age / this.maxAge);
      
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      
      ctx.strokeStyle = `rgba(255, 255, 153, ${0.8 * alpha})`;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ffff99';
      
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const x = Math.cos(angle) * this.size;
        const y = Math.sin(angle) * this.size;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      
      ctx.fillStyle = `rgba(255, 255, 153, ${0.5 * alpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
      this.particles.forEach(p => p.draw(ctx));
    }
    
    isDone() {
      return this.age >= this.maxAge && this.particles.length === 0;
    }
  }
  
  class PurpleEffect {
    constructor(x, y, size) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.age = 0;
      this.maxAge = 80;
      this.expansion = 0;
      this.particles = [];
      
      for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2;
        const radius = size * 2;
        const startX = x + Math.cos(angle) * radius;
        const startY = y + Math.sin(angle) * radius;
        this.particles.push(new Particle(startX, startY, -Math.cos(angle) * 3.5, -Math.sin(angle) * 3.5, '#b500ff', size * 0.8));
      }
    }
    
    update() {
      this.age++;
      this.expansion = Math.sin(this.age / this.maxAge * Math.PI) * this.size * 0.6;
      this.particles.forEach(p => p.update());
      this.particles = this.particles.filter(p => !p.isDead());
    }
    
    draw(ctx) {
      ctx.save();
      const alpha = Math.max(0, 1 - this.age / this.maxAge);
      
      ctx.fillStyle = `rgba(181, 0, 255, ${0.4 * alpha})`;
      ctx.shadowBlur = 40 * intensity;
      ctx.shadowColor = '#b500ff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size + this.expansion, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#b500ff';
      for (let i = 1; i <= 4; i++) {
        ctx.globalAlpha = alpha * (1 - i / 4);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, (this.size * i * 0.5) + this.expansion, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      ctx.restore();
      this.particles.forEach(p => p.draw(ctx));
    }
    
    isDone() {
      return this.age >= this.maxAge && this.particles.length === 0;
    }
  }
  
  class MahoragaEffect {
    constructor(x, y, size) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.age = 0;
      this.maxAge = 120;
      this.rotation = 0;
    }
    
    update() {
      this.rotation += 0.1;
      this.age++;
    }
    
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      
      const alpha = Math.max(0, 1 - this.age / this.maxAge);
      ctx.strokeStyle = `rgba(255, 215, 0, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 30 * intensity;
      ctx.shadowColor = '#ffd700';
      
      // Central circle
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.4, 0, Math.PI * 2);
      ctx.stroke();
      
      // Rings
      for (let i = 1; i <= 10; i++) {
        ctx.globalAlpha = alpha * Math.max(0, 1 - i / 10);
        ctx.beginPath();
        ctx.arc(0, 0, (this.size * i) / 10, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Spokes
      ctx.globalAlpha = alpha;
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const x = Math.cos(angle) * this.size;
        const y = Math.sin(angle) * this.size;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      
      ctx.restore();
    }
    
    isDone() {
      return this.age >= this.maxAge;
    }
  }
  
  class BlackflashEffect {
    constructor(x, y, size) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.age = 0;
      this.maxAge = 40;
    }
    
    update() {
      this.age++;
    }
    
    draw(ctx) {
      const progress = this.age / this.maxAge;
      const alpha = Math.max(0, 1 - progress);
      
      // White flash
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Black cross
      ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 1.2})`;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(this.x - this.size * progress * 1.5, this.y);
      ctx.lineTo(this.x + this.size * progress * 1.5, this.y);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - this.size * progress * 1.5);
      ctx.lineTo(this.x, this.y + this.size * progress * 1.5);
      ctx.stroke();
      
      // Impact ring
      ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.8})`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * progress * 2.5, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    isDone() {
      return this.age >= this.maxAge;
    }
  }
  
  class FugaEffect {
    constructor(x, y, size) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.age = 0;
      this.maxAge = 120;
      this.rotation = 0;
    }
    
    update() {
      this.age++;
      this.rotation += 0.2;
      this.size += 0.6;
    }
    
    draw(ctx) {
      ctx.save();
      const alpha = Math.max(0, 1 - this.age / this.maxAge);
      
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      
      ctx.strokeStyle = `rgba(255, 140, 0, ${alpha * 0.8})`;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 30 * intensity;
      ctx.shadowColor = '#ff8c00';
      
      // Tornado spiral
      for (let i = 0; i < 6; i++) {
        const offset = (i * Math.PI) / 3;
        ctx.beginPath();
        for (let j = 0; j < 60; j++) {
          const angle = (j / 60) * Math.PI * 2 + offset;
          const radius = (j / 60) * this.size * 2.5;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      
      ctx.restore();
    }
    
    isDone() {
      return this.age >= this.maxAge;
    }
  }
  
  class TodoEffect {
    constructor(x, y, size) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.age = 0;
      this.maxAge = 60;
      this.particles = [];
      
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.5 + Math.random() * 4.5;
        this.particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, '#ffeb3b', size * 0.7));
      }
    }
    
    update() {
      this.age++;
      this.particles.forEach(p => p.update());
      this.particles = this.particles.filter(p => !p.isDead());
    }
    
    draw(ctx) {
      ctx.save();
      const alpha = Math.max(0, 1 - this.age / this.maxAge);
      
      ctx.fillStyle = `rgba(255, 235, 59, ${alpha * 0.5})`;
      ctx.shadowBlur = 40 * intensity;
      ctx.shadowColor = '#ffeb3b';
      
      // Clap hands effect
      const offset = 30 * (1 - this.age / this.maxAge);
      ctx.beginPath();
      ctx.arc(this.x - offset, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(this.x + offset, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
      this.particles.forEach(p => p.draw(ctx));
    }
    
    isDone() {
      return this.age >= this.maxAge && this.particles.length === 0;
    }
  }
  
  function spawnEffect(x, y) {
    let effect;
    
    if (currentMode === 'gojo') {
      effect = gojoMode === 'blue' 
        ? new GojoBlueEffect(x, y, particleSize)
        : new GojoRedEffect(x, y, particleSize);
    } else if (currentMode === 'purple') {
      effect = new PurpleEffect(x, y, particleSize * 1.3);
    } else if (currentMode === 'sukuna') {
      effect = new SukunaEffect(x, y, particleSize);
    } else if (currentMode === 'mahoraga') {
      effect = new MahoragaEffect(x, y, particleSize);
    } else if (currentMode === 'blackflash') {
      effect = new BlackflashEffect(x, y, particleSize);
    } else if (currentMode === 'fuga') {
      effect = new FugaEffect(x, y, particleSize * 0.9);
    } else if (currentMode === 'todo') {
      effect = new TodoEffect(x, y, particleSize);
    } else {
      effect = new GojoBlueEffect(x, y, particleSize);
    }
    
    effects.push(effect);
  }
  
  function animate() {
    // Clear with trail
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (isActive) {
      effects.forEach(effect => effect.update());
      effects = effects.filter(effect => !effect.isDone());
      effects.forEach(effect => effect.draw(ctx));
    }
    
    // Draw UI
    if (isActive) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('JJK GIMKIT MODE ACTIVE', 10, 25);
      ctx.font = '11px Arial';
      ctx.fillText(`Mode: ${currentMode.toUpperCase()} | [H] to toggle`, 10, 40);
      ctx.fillText('[Y]Gojo [P]Purple [S]Sukuna [M]Mahoraga [B]Blackflash [F]Fuga [T]Todo', 10, 55);
    } else {
      ctx.fillStyle = 'rgba(255, 100, 100, 0.9)';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Press [H] to Activate JJK Effects', canvas.width / 2, canvas.height / 2);
    }
    
    requestAnimationFrame(animate);
  }
  
  animate();
  console.log('%c🔥 JJK GIMKIT EFFECTS ACTIVATED! 🔥', 'color: #ff1744; font-size: 16px; font-weight: bold;');
  console.log('%cPress [H] to toggle | Click to spawn effects | Use keyboard shortcuts to change modes', 'color: #00d4ff; font-size: 12px;');
})();
