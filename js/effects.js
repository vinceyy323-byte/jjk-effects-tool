// Particle System
class Particle {
    constructor(x, y, vx, vy, color, size, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.maxLife = life;
        this.life = life;
        this.alpha = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        this.life--;
        this.alpha = this.life / this.maxLife;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
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

// Energy Wave
class EnergyWave {
    constructor(x, y, maxRadius, color, duration) {
        this.x = x;
        this.y = y;
        this.maxRadius = maxRadius;
        this.currentRadius = 0;
        this.color = color;
        this.duration = duration;
        this.age = 0;
        this.alpha = 1;
    }

    update() {
        this.age++;
        this.currentRadius = (this.age / this.duration) * this.maxRadius;
        this.alpha = 1 - (this.age / this.duration);
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    isDone() {
        return this.age >= this.duration;
    }
}

// Gojo Blue Effect
class GojoBlue {
    constructor(x, y, size, intensity) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.intensity = intensity;
        this.particles = [];
        this.waves = [];
        this.rotation = 0;
        
        // Create particles in circular pattern
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const speed = 2 + Math.random() * 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            this.particles.push(new Particle(x, y, vx, vy, '#00a8ff', size * 0.8, 60));
        }

        // Create energy wave
        this.waves.push(new EnergyWave(x, y, size * 3, 'rgba(0, 168, 255, 0.6)', 40));
    }

    update() {
        this.rotation += 0.05;
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => !p.isDead());
        
        this.waves.forEach(w => w.update());
        this.waves = this.waves.filter(w => !w.isDone());
    }

    draw(ctx) {
        // Draw core glow
        ctx.save();
        ctx.fillStyle = 'rgba(0, 168, 255, 0.3)';
        ctx.shadowBlur = 20 * this.intensity;
        ctx.shadowColor = '#00a8ff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw rotating ring
        ctx.strokeStyle = '#00a8ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.7, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

        // Draw particles
        this.particles.forEach(p => p.draw(ctx));

        // Draw waves
        this.waves.forEach(w => w.draw(ctx));
    }

    isDone() {
        return this.particles.length === 0 && this.waves.length === 0;
    }
}

// Gojo Red Effect
class GojoRed {
    constructor(x, y, size, intensity) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.intensity = intensity;
        this.particles = [];
        this.waves = [];
        this.expansion = 0;

        // Create particles spiraling outward
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 2.5;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            this.particles.push(new Particle(x, y, vx, vy, '#ff3333', size * 0.6, 50));
        }

        // Multiple waves
        this.waves.push(new EnergyWave(x, y, size * 2, 'rgba(255, 51, 51, 0.7)', 35));
        this.waves.push(new EnergyWave(x, y, size * 3.5, 'rgba(255, 51, 51, 0.4)', 50));
    }

    update() {
        this.expansion += 0.2;
        this.particles.forEach(p => {
            p.update();
            // Accelerate outward
            const dist = Math.hypot(p.x - this.x, p.y - this.y);
            const dx = p.x - this.x;
            const dy = p.y - this.y;
            if (dist > 0) {
                p.vx += (dx / dist) * 0.1;
                p.vy += (dy / dist) * 0.1;
            }
        });
        this.particles = this.particles.filter(p => !p.isDead());

        this.waves.forEach(w => w.update());
        this.waves = this.waves.filter(w => !w.isDone());
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 51, 51, 0.2)';
        ctx.shadowBlur = 25 * this.intensity;
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
        this.waves.forEach(w => w.draw(ctx));
    }

    isDone() {
        return this.particles.length === 0 && this.waves.length === 0;
    }
}

// Sukuna Effect
class SukunaEffect {
    constructor(x, y, size, intensity) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.intensity = intensity;
        this.particles = [];
        this.rotation = 0;
        this.lines = [];
        this.age = 0;
        this.maxAge = 80;

        // Create chaotic particle burst
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            this.particles.push(new Particle(x, y, vx, vy, '#ffffff', size * 0.5, 70));
        }

        // Create cursed lines
        for (let i = 0; i < 8; i++) {
            this.lines.push({
                angle: (i / 8) * Math.PI * 2,
                length: size * 2,
                alpha: 1
            });
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

        // Draw cursed lines
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 * (1 - this.age / this.maxAge)})`;
        ctx.lineWidth = 2;
        this.lines.forEach(line => {
            const x = Math.cos(line.angle) * line.length;
            const y = Math.sin(line.angle) * line.length;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(x, y);
            ctx.stroke();
        });

        // Draw core
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * (1 - this.age / this.maxAge)})`;
        ctx.shadowBlur = 20 * this.intensity;
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

// Purple Effect
class PurpleEffect {
    constructor(x, y, size, intensity) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.intensity = intensity;
        this.particles = [];
        this.age = 0;
        this.maxAge = 60;
        this.expansion = 0;

        // Create converging particles
        for (let i = 0; i < 25; i++) {
            const angle = (i / 25) * Math.PI * 2;
            const radius = size * 2;
            const startX = x + Math.cos(angle) * radius;
            const startY = y + Math.sin(angle) * radius;
            const vx = -Math.cos(angle) * 3;
            const vy = -Math.sin(angle) * 3;
            this.particles.push(new Particle(startX, startY, vx, vy, '#9d00ff', size * 0.7, 60));
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
        ctx.shadowBlur = 30 * this.intensity;
        ctx.shadowColor = '#9d00ff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size + this.expansion, 0, Math.PI * 2);
        ctx.fill();

        // Draw multiple rings
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

// Mahoraga Effect
class MahoragaEffect {
    constructor(x, y, size, intensity) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.intensity = intensity;
        this.rotation = 0;
        this.age = 0;
        this.maxAge = 100;
        this.rings = 8;
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

        // Draw adaptive wheel
        ctx.strokeStyle = `rgba(255, 215, 0, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 20 * this.intensity;
        ctx.shadowColor = '#ffd700';

        // Central circle
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
        ctx.stroke();

        // Rings
        for (let i = 1; i <= this.rings; i++) {
            const radius = (this.size * i) / this.rings;
            ctx.globalAlpha = alpha * (1 - i / this.rings);
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Spokes
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

// Blackflash Effect
class BlackflashEffect {
    constructor(x, y, size, intensity) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.intensity = intensity;
        this.age = 0;
        this.maxAge = 30;
    }

    update() {
        this.age++;
    }

    draw(ctx) {
        const progress = this.age / this.maxAge;
        const alpha = 1 - progress;

        // Flash
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Black cross
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

        // Impact ring
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

// Fuga Effect
class FugaEffect {
    constructor(x, y, size, intensity) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.intensity = intensity;
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

        // Tornado spiral
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.strokeStyle = `rgba(255, 140, 0, ${alpha * 0.7})`;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 25 * this.intensity;
        ctx.shadowColor = '#ff8c00';

        // Draw spiral
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

// Todo Effect
class TodoEffect {
    constructor(x, y, size, intensity) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.intensity = intensity;
        this.age = 0;
        this.maxAge = 50;
        this.particles = [];

        // Create clap energy burst
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            this.particles.push(new Particle(x, y, vx, vy, '#ffff00', size * 0.6, 60));
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

        // Hand clap effect
        ctx.fillStyle = `rgba(255, 255, 0, ${alpha * 0.3})`;
        ctx.shadowBlur = 30 * this.intensity;
        ctx.shadowColor = '#ffff00';

        // Two circles (hands clapping)
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

// Export all effects
window.Effects = {
    GojoBlue,
    GojoRed,
    SukunaEffect,
    PurpleEffect,
    MahoragaEffect,
    BlackflashEffect,
    FugaEffect,
    TodoEffect
};
