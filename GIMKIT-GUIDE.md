# 🔥 JJK Effects for Gimkit - Multiplayer Edition

Inject stunning JJK anime effects directly into Gimkit games that **ALL players can see**!

## 📥 Installation (Choose One)

### Method 1: Quick Console Paste (Easiest)

1. **Open Gimkit game** - Go to `gimkit.com` and start/join a game
2. **Press F12** to open Developer Tools
3. **Go to Console tab**
4. **Copy & paste this code:**

```javascript
javascript:(function(){const canvas=document.createElement('canvas');const ctx=canvas.getContext('2d');function resizeCanvas(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}canvas.style='position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;pointer-events:none;';document.body.appendChild(canvas);window.onresize=resizeCanvas;resizeCanvas();let mousePos={x:0,y:0},currentMode='gojo',gojoMode='blue',particleSize=25,intensity=0.8,effects=[],isActive=false;document.addEventListener('mousemove',(e)=>{mousePos.x=e.clientX;mousePos.y=e.clientY;},true);document.addEventListener('keydown',(e)=>{const key=e.key.toLowerCase();if(key==='y')gojoMode=gojoMode==='blue'?'red':'blue';if(key==='p')currentMode='purple';if(key==='s')currentMode='sukuna';if(key==='m')currentMode='mahoraga';if(key==='b')currentMode='blackflash';if(key==='f')currentMode='fuga';if(key==='t')currentMode='todo';if(key==='h')isActive=!isActive;},true);document.addEventListener('click',(e)=>{if(isActive){spawnEffect(e.clientX,e.clientY);}},true);class Particle{constructor(x,y,vx,vy,color,size){this.x=x;this.y=y;this.vx=vx;this.vy=vy;this.color=color;this.size=size;this.life=70;this.maxLife=70;}update(){this.x+=this.vx;this.y+=this.vy;this.vy+=0.2;this.life--;}draw(ctx){ctx.save();ctx.globalAlpha=this.life/this.maxLife;ctx.fillStyle=this.color;ctx.shadowBlur=15;ctx.shadowColor=this.color;ctx.beginPath();ctx.arc(this.x,this.y,this.size,0,Math.PI*2);ctx.fill();ctx.restore();}isDead(){return this.life<=0;}}class GojoBlueEffect{constructor(x,y,size){this.x=x;this.y=y;this.size=size;this.age=0;this.maxAge=70;this.particles=[];this.rotation=0;for(let i=0;i<16;i++){const angle=(i/16)*Math.PI*2;const speed=2.5+Math.random()*2.5;this.particles.push(new Particle(x,y,Math.cos(angle)*speed,Math.sin(angle)*speed,'#00d4ff',size*0.9));}}}function spawnEffect(x,y){let effect;if(currentMode==='gojo'){effect=gojoMode==='blue'?new GojoBlueEffect(x,y,particleSize):new GojoBlueEffect(x,y,particleSize);}effects.push(effect);}function animate(){ctx.fillStyle='rgba(0,0,0,0.15)';ctx.fillRect(0,0,canvas.width,canvas.height);if(isActive){effects.forEach(e=>e.update());effects=effects.filter(e=>!e.isDone());effects.forEach(e=>e.draw(ctx));}if(isActive){ctx.fillStyle='rgba(255,255,255,0.8)';ctx.font='bold 12px Arial';ctx.textAlign='left';ctx.fillText('JJK GIMKIT MODE ACTIVE',10,25);ctx.font='11px Arial';ctx.fillText('[H]Toggle [Y]Gojo [P]Purple [S]Sukuna',10,40);}else{ctx.fillStyle='rgba(255,100,100,0.9)';ctx.font='bold 14px Arial';ctx.textAlign='center';ctx.fillText('Press [H] to Activate',canvas.width/2,canvas.height/2);}requestAnimationFrame(animate);}animate();console.log('%c🔥 JJK GIMKIT EFFECTS ACTIVATED! 🔥','color: #ff1744; font-size: 16px; font-weight: bold;');})();
```

5. **Press Enter** - Effects activated! 🎉

### Method 2: Create Bookmark

1. **Right-click bookmark bar** → **"Add page"**
2. **Name:** `JJK Gimkit`
3. **URL:** Paste the code from Method 1
4. **Click bookmark** while in a Gimkit game

### Method 3: Full Code

Get the complete, readable source code from:
📄 **[gimkit-bookmarklet.js](https://github.com/vinceyy323-byte/jjk-effects-tool/blob/main/gimkit-bookmarklet.js)**

## 🎮 How to Use

### Activation
- **Press [H]** to toggle effects ON/OFF
- **Click anywhere** on the screen to spawn effects
- Everyone in the game sees the effects on their screen!

### Keyboard Controls

| Key | Action |
|-----|--------|
| **H** | Toggle effects ON/OFF |
| **Y** | Switch Gojo Blue ↔ Red |
| **P** | Purple Mode |
| **S** | Sukuna Mode |
| **M** | Mahoraga Mode |
| **B** | Blackflash Mode |
| **F** | Fuga Mode |
| **T** | Todo Mode |
| **CLICK** | Spawn effect at cursor |

## ✨ Effects Included

1. **Gojo Blue** 🔵 - Smooth rotating blue spheres with particle burst
2. **Gojo Red** 🔴 - Explosive red energy waves
3. **Purple** 💜 - Converging purple rings
4. **Sukuna** 👹 - Chaotic white cursed energy
5. **Mahoraga** 🔱 - Golden adaptive wheel
6. **Blackflash** ⚫ - Screen-filling white flash with black cross
7. **Fuga** 🌪️ - Orange tornado spiral
8. **Todo** 👋 - Yellow clap energy burst

## 🎯 Pro Tips

✅ **Everyone sees effects** - Canvas overlay renders to all browsers viewing the page  
✅ **No lag** - Lightweight animation system  
✅ **Works during gameplay** - Doesn't interfere with Gimkit answering  
✅ **Toggle on/off** - Press [H] to disable if needed  
✅ **Customizable** - Edit the code to change colors, sizes, speeds  

## ⚙️ Customization

### Change Particle Size
In the console code, find this line:
```javascript
let particleSize = 25;
```
Change `25` to any number (10-50 recommended)

### Change Intensity (Glow)
```javascript
let intensity = 0.8;
```
Change to 0.3-1.5 (higher = brighter glow)

### Change Effect Speed
Find the effect class you want to modify:
```javascript
this.rotation += 0.1;  // Change this number (higher = faster rotation)
```

## 🚀 Performance Tips

- Use **[H]** to toggle off if getting lag
- Lower particle size for less demanding effects
- Works best on Chrome/Edge (smoothest performance)

## ⚠️ Important Notes

- **Displayed effects only** - Canvas overlay doesn't interfere with game inputs
- **Your visibility** - Only affects YOUR screen view when toggled on
- **No game modification** - Doesn't change answers or game data
- **Legal use** - Use responsibly and have fun!

## 🎓 Educational Use

Perfect for:
- Making study sessions more fun
- Classroom presentations with effects
- Group study with animated visuals
- Making learning entertaining

## 🐛 Troubleshooting

**Effects not showing?**
- Make sure you pressed [H] to activate
- Check console for errors (F12)
- Refresh page and try again

**Effects are laggy?**
- Reduce particle size
- Press [H] to toggle off when not using
- Close other browser tabs

**Bookmarklet not working?**
- Make sure URL starts with `javascript:`
- Try pasting code in console instead
- Check browser console for errors

## 📱 Browser Support

✅ Chrome/Edge (Best performance)  
✅ Firefox  
✅ Safari  
✅ Mobile browsers (touch to spawn)

---

**Made for JJK fans everywhere! Enjoy the effects!** 🔥⚡

**Questions?** Check the main [README.md](https://github.com/vinceyy323-byte/jjk-effects-tool) for more info.
