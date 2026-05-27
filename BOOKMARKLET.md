// JJK Effects Bookmarklet - Copy and paste into browser console or bookmark
// Usage: Save this as a bookmark and click it on any website to activate JJK effects

javascript:(function() {
  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  canvas.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;pointer-events:none;';
  document.body.appendChild(canvas);
  window.onresize = resizeCanvas;
  resizeCanvas();
  
  // State
  let mousePos = { x: 0, y: 0 };
  let currentMode = 'gojo';
  let gojoMode = 'blue';
  let particleSize = 20;
  let intensity = 0.7;
  let effects = [];
  
  // Mouse tracking
  window.onmousemove = (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
  };
  
  // Keyboard controls
  window.onkeydown = (e) => {
    const key = e.key.toLowerCase();
    if (key === 'y') gojoMode = gojoMode === 'blue' ? 'red' : 'blue';
    if (key === 'p') currentMode = 'purple';
    if (key === 's') currentMode = 'sukuna';
    if (key === 'm') currentMode = 'mahoraga';
    if (key === 'b') currentMode = 'blackflash';
    if (key === 'f') currentMode = 'fuga';
    if (key === 't') currentMode = 'todo';
  };
  
  // Click to spawn effects
  window.onclick = () => {
    spawnEffect(mousePos.x, mousePos.y);
  };
  
  // Particle class
  class Particle {
    constructor(x, y, vx, vy, color, size) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.color = color;
      this.size = size;
      this.life = 60;
      this.maxLife = 60;
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.15;
      this.life--;
    }
    
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.life / this.maxLife;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    isDead() {
      return this.life <= 0;
    }
  }
  
  // Effect classes
  class GojoBlueEffect {
    constructor(x, y, size) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.age = 0;
      this.maxAge = 60;
      this.particles = [];
      this.rotation = 0;
      
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const speed = 2 + Math.random() * 2;
        this.particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, '#00a8ff', size * 0.8));
      }
    }
    
    update() {
      this.rotation += 0.05;
      this.age++;
      this.particles.forEach(p => p.update());
      this.particles = this.particles.filter(p => !p.isDead());
    }
    
    draw(ctx) {
      ctx.save();
      ctx.fillStyle = `rgba(0, 168, 255, ${0.3 * (1 - this.age / this.maxAge)})`;
      ctx.shadowBlur = 20 * intensity;
      ctx.shadowColor = '#00a8ff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#00a8ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.7, 0, Math.PI * 2);
      ctx.stroke();
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
      this.maxAge = 50;
      this.expansion = 0;
      this.particles = [];
      
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 2.5;
        this.particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, '#ff3333', size * 0.6));
      }
    }
    
    update() {
      this.expansion += 0.2;
      this.age++;
      this.particles.forEach(p => {
        p.update();
        const dist = Math.hypot(p.x - this.x, p.y - this.y);
        if (dist > 0) {
          p.vx += ((p.x - this.x) / dist) * 0.1;
          p.vy += ((p.y - this.y) / dist) * 0.1;
        }
      });
      this.particles = this.particles.filter(p => !p.isDead());
    }
    
    draw(ctx) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 51, 51, ${0.2 * (1 - this.age / this.maxAge)})`;
      ctx.shadowBlur = 25 * intensity;
      ctx.shadowColor = '#ff3333';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size + this.expansion, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#ff3333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
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
      this.maxAge = 80;
      this.rotation = 0;
      this.particles = [];
      
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        this.particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, '#ffffff', size * 0.5));
      }
    }
    
    update() {
      this.rotation += 0.15;
      this.age++;
      this.particles.forEach(p => p.update());
      this.particles = this.particles.filter(p => !p.isDead());
    }
    
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 * (1 - this.age / this.maxAge)})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * this.size;
        const y = Math.sin(angle) * this.size;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      
      ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * (1 - this.age / this.maxAge)})`;
      ctx.shadowBlur = 20 * intensity;
      ctx.shadowColor = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
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
      this.maxAge = 60;
      this.expansion = 0;
      this.particles = [];
      
      for (let i = 0; i < 25; i++) {
        const angle = (i / 25) * Math.PI * 2;
        const radius = size * 2;
        const startX = x + Math.cos(angle) * radius;
        const startY = y + Math.sin(angle) * radius;
        this.particles.push(new Particle(startX, startY, -Math.cos(angle) * 3, -Math.sin(angle) * 3, '#9d00ff', size * 0.7));
      }
    }
    
    update() {
      this.age++;
      this.expansion = Math.sin(this.age / this.maxAge * Math.PI) * this.size * 0.5;
      this.particles.forEach(p => p.update());
      this.particles = this.particles.filter(p => !p.isDead());
    }
    
    draw(ctx) {
      ctx.save();
      ctx.fillStyle = `rgba(157, 0, 255, ${0.3 * (1 - this.age / this.maxAge)})`;
      ctx.shadowBlur = 30 * intensity;
      ctx.shadowColor = '#9d00ff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size + this.expansion, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#9d00ff';
      for (let i = 1; i <= 3; i++) {
        ctx.globalAlpha = (1 - this.age / this.maxAge) * (1 - i / 3);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, (this.size * i) + this.expansion, 0, Math.PI * 2);
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
      this.maxAge = 100;
      this.rotation = 0;
    }
    
    update() {
      this.rotation += 0.08;
      this.age++;
    }
    
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      
      const alpha = 1 - (this.age / this.maxAge);
      ctx.strokeStyle = `rgba(255, 215, 0, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 20 * intensity;
      ctx.shadowColor = '#ffd700';
      
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
      ctx.stroke();
      
      for (let i = 1; i <= 8; i++) {
        ctx.globalAlpha = alpha * (1 - i / 8);
        ctx.beginPath();
        ctx.arc(0, 0, (this.size * i) / 8, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      ctx.globalAlpha = alpha;
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
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
      this.maxAge = 30;
    }
    
    update() {
      this.age++;
    }
    
    draw(ctx) {
      const progress = this.age / this.maxAge;
      const alpha = 1 - progress;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(this.x - this.size * progress, this.y);
      ctx.lineTo(this.x + this.size * progress, this.y);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - this.size * progress);
      ctx.lineTo(this.x, this.y + this.size * progress);
      ctx.stroke();
      
      ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.6})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * progress * 2, 0, Math.PI * 2);
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
      this.maxAge = 100;
      this.rotation = 0;
    }
    
    update() {
      this.age++;
      this.rotation += 0.15;
      this.size += 0.5;
    }
    
    draw(ctx) {
      ctx.save();
      const alpha = Math.max(0, 1 - (this.age / this.maxAge));
      
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      
      ctx.strokeStyle = `rgba(255, 140, 0, ${alpha * 0.7})`;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 25 * intensity;
      ctx.shadowColor = '#ff8c00';
      
      for (let i = 0; i < 5; i++) {
        const offset = (i * Math.PI) / 2.5;
        ctx.beginPath();
        for (let j = 0; j < 50; j++) {
          const angle = (j / 50) * Math.PI * 2 + offset;
          const radius = (j / 50) * this.size * 2;
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
      this.maxAge = 50;
      this.particles = [];
      
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        this.particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, '#ffff00', size * 0.6));
      }
    }
    
    update() {
      this.age++;
      this.particles.forEach(p => p.update());
      this.particles = this.particles.filter(p => !p.isDead());
    }
    
    draw(ctx) {
      ctx.save();
      const alpha = Math.max(0, 1 - (this.age / this.maxAge));
      
      ctx.fillStyle = `rgba(255, 255, 0, ${alpha * 0.3})`;
      ctx.shadowBlur = 30 * intensity;
      ctx.shadowColor = '#ffff00';
      
      const offset = 20 * (1 - this.age / this.maxAge);
      ctx.beginPath();
      ctx.arc(this.x - offset, this.y, this.size * 0.8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(this.x + offset, this.y, this.size * 0.8, 0, Math.PI * 2);
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
      effect = new PurpleEffect(x, y, particleSize * 1.2);
    } else if (currentMode === 'sukuna') {
      effect = new SukunaEffect(x, y, particleSize);
    } else if (currentMode === 'mahoraga') {
      effect = new MahoragaEffect(x, y, particleSize);
    } else if (currentMode === 'blackflash') {
      effect = new BlackflashEffect(x, y, particleSize);
    } else if (currentMode === 'fuga') {
      effect = new FugaEffect(x, y, particleSize * 0.8);
    } else if (currentMode === 'todo') {
      effect = new TodoEffect(x, y, particleSize);
    } else {
      effect = new GojoBlueEffect(x, y, particleSize);
    }
    
    effects.push(effect);
  }
  
  function animate() {
    ctx.fillStyle = 'rgba(10, 14, 39, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(10, 14, 39, 0.1)');
    gradient.addColorStop(0.5, 'rgba(26, 26, 62, 0.05)');
    gradient.addColorStop(1, 'rgba(10, 14, 39, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    effects.forEach(effect => effect.update());
    effects = effects.filter(effect => !effect.isDone());
    
    effects.forEach(effect => effect.draw(ctx));
    
    // Draw cursor indicator
    ctx.strokeStyle = 'rgba(0, 255, 200, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(mousePos.x, mousePos.y, particleSize * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.strokeStyle = 'rgba(0, 255, 200, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mousePos.x - particleSize * 0.3, mousePos.y);
    ctx.lineTo(mousePos.x + particleSize * 0.3, mousePos.y);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(mousePos.x, mousePos.y - particleSize * 0.3);
    ctx.lineTo(mousePos.x, mousePos.y + particleSize * 0.3);
    ctx.stroke();
    
    requestAnimationFrame(animate);
  }
  
  animate();
})();
