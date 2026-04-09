/* ============================================================
   Lina · Birthday Surprise  —  脚本
   ============================================================ */

/* ---------- 1. 信封切换 ---------- */
const stageEnv  = document.getElementById('stage-envelope');
const stageGift = document.getElementById('stage-gift');
const flap      = document.querySelector('.flap');
const signBox   = document.getElementById('signature');

signBox.addEventListener('input',()=>{
  const signature = signBox.innerText.trim();
  const canOpenEnvelope = signature.toLowerCase() === 'namgnal' || signature === '王彦苹';
  if(canOpenEnvelope){
    signBox.setAttribute('contenteditable','false');
    flap.style.animation='flap-open .9s forwards';
    setTimeout(()=>{
      stageEnv.classList.remove('active');
      stageGift.classList.add('active');
      console.log('Gift stage activated.'); // 调试日志
    },1000);
  }
});

/* ---------- 2. 留声机按钮 ---------- */
const player   = document.getElementById('vinylPlayer');
const playBtn  = document.getElementById('play');
const pauseBtn = document.getElementById('pause');
const audio    = document.getElementById('audio');

playBtn.addEventListener('click',()=>{
  audio.play();
  player.classList.add('playing');
});
pauseBtn.addEventListener('click',stopPlayback);
audio.addEventListener('ended',stopPlayback);

function stopPlayback(){
  audio.pause();
  player.classList.remove('playing');
  const spinning = document.querySelector('.table-disk');
  spinning?.remove();
  if(currentTrayDisk) currentTrayDisk.classList.remove('hidden');
  currentTrayDisk=null;
}

/* ---------- 3. 拖动唱片播放 ---------- */
const disks       = document.querySelectorAll('.disk');
const turntable   = document.querySelector('.turntable');
let   currentTrayDisk = null;

disks.forEach(disk=>{
  disk.addEventListener('dragstart',e=>{
    disk.classList.add('dragging');
    e.dataTransfer.setData('src',disk.dataset.src);
    e.dataTransfer.setData('label',disk.querySelector('.disk-label').textContent);
  });
  disk.addEventListener('dragend',()=>disk.classList.remove('dragging'));
});

turntable.addEventListener('dragover',e=>e.preventDefault());

turntable.addEventListener('drop',e=>{
  e.preventDefault();
  const src   = e.dataTransfer.getData('src');
  const label = e.dataTransfer.getData('label');
  if(!src) return;
  stopPlayback();
  const trayDisk = Array.from(disks).find(d=>d.querySelector('.disk-label').textContent===label);
  if(!trayDisk) return;
  const clone = document.createElement('div');
  clone.className='table-disk';
  clone.title = label;
  turntable.appendChild(clone);
  trayDisk.classList.add('hidden');
  currentTrayDisk = trayDisk;
  audio.src=src;
  audio.play();
  player.classList.add('playing');
});

/* ============================================================
   4. 手动拖动顶盖移除
   ============================================================ */
const lid        = document.querySelector('.top');
let   isDragging = false;
let   startY     = 0;

lid.addEventListener('pointerdown',e=>{
  if(lid.classList.contains('removed')) return;
  isDragging=true; startY=e.clientY;
  lid.classList.add('dragging');
  lid.setPointerCapture(e.pointerId);
});

lid.addEventListener('pointermove',e=>{
  if(!isDragging) return;
  const dy = e.clientY - startY;
  const translate = Math.min(0, dy);
  lid.style.transform = `rotateX(90deg) translateZ(calc(var(--size)/2)) translateY(${translate}px)`;
});

lid.addEventListener('pointerup',e=>{
  if(!isDragging) return;
  isDragging=false; lid.classList.remove('dragging');
  const dy = e.clientY - startY;
  if(dy < -120){
    lid.classList.add('removed');
    lid.style.transform='';
    console.log('Lid removed.'); // 调试日志
  }else{
    lid.style.transform='';
  }
});

/* ============================================================
   5. 点击任意侧板向外翻 / 收回 (并检测烟花触发)
   ============================================================ */
const panels = document.querySelectorAll('.gift-box .front, .gift-box .back, .gift-box .left, .gift-box .right');
console.log('Panels selected:', panels); // 调试日志

const fireworksContainer = document.getElementById('fireworks-container');
let fireworksPlayed = false;

if (!fireworksContainer) { // 初始检查烟花容器是否存在
    console.error('CRITICAL: Fireworks container element not found on initial script load!');
}

function allPanelsOpen() {
    const result = Array.from(panels).every(panel => panel.classList.contains('open'));
    // console.log('allPanelsOpen check result:', result); // 这个日志太频繁，可以保持注释
    return result;
}

function createFireworkBurst(container) {
    console.log('Attempting to create firework burst...'); // 调试日志
    const numParticles = 70 + Math.floor(Math.random() * 50);
    const burstX = Math.random() * window.innerWidth;
    const burstY = Math.random() * window.innerHeight * 0.8;
    const colors = ['#FFD700', '#FF4500', '#32CD32', '#1E90FF', '#00CED1', '#FF00FF', '#FFFF00', '#FFFFFF', '#FF69B4', '#ADD8E6', '#FF6347', '#7FFF00'];

    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 150 + 100;
        const particleColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.backgroundColor = particleColor;
        const initialSize = Math.random() * 3 + 2;
        particle.style.width = initialSize + 'px';
        particle.style.height = initialSize + 'px';
        particle.style.opacity = '1';
        particle.style.left = burstX + 'px';
        particle.style.top = burstY + 'px';
        const targetX = Math.cos(angle) * speed;
        const targetY = Math.sin(angle) * speed;
        particle.style.setProperty('--tx', targetX + 'px');
        particle.style.setProperty('--ty', targetY + 'px');
        const duration = 0.8 + Math.random() * 0.7;
        particle.style.animation = `burst ${duration}s cubic-bezier(0.1, 0.5, 0.2, 1) forwards`;
        container.appendChild(particle); // 确保添加到正确的容器
        // console.log('Particle appended:', particle); // 这个日志也可能很频繁
        setTimeout(() => {
            if (particle.parentNode) {
                 particle.remove();
            }
        }, duration * 1000 + 200);
    }
}

function playFireworks() {
    console.log('playFireworks() function has been called.'); // 调试日志
    if (!fireworksContainer) {
        console.error("CRITICAL: Fireworks container not found inside playFireworks()!");
        return;
    }
    fireworksContainer.style.display = 'block';
    fireworksContainer.innerHTML = ''; 
    console.log('Fireworks container display has been set to block.'); // 调试日志

    const showDuration = 10000;
    const intervalBetweenFireworks = 600;
    let fireworksLaunchedCount = 0;
    const maxFireworksToLaunch = Math.floor(showDuration / intervalBetweenFireworks);

    console.log(`Starting fireworks show: ${maxFireworksToLaunch} bursts over ${showDuration/1000}s.`); // 调试日志

    const launchIntervalId = setInterval(() => {
        if (fireworksLaunchedCount >= maxFireworksToLaunch) {
            clearInterval(launchIntervalId);
            console.log('Fireworks interval cleared after all bursts.'); // 调试日志
            return;
        }
        createFireworkBurst(fireworksContainer);
        fireworksLaunchedCount++;
    }, intervalBetweenFireworks);

    setTimeout(() => {
        console.log('Hiding fireworks container after the show duration.'); // 调试日志
        if (fireworksContainer) { // 再次检查，以防万一
            fireworksContainer.style.display = 'none';
            fireworksContainer.innerHTML = '';
        }
    }, showDuration + 1500); 
}


panels.forEach(panel => {
    panel.addEventListener('click', () => {
        console.log('Panel clicked:', panel.className); 
        if (!lid.classList.contains('removed')) {
            console.log('Lid not removed, panel click ignored for fireworks logic.');
            return;
        }

        panel.classList.toggle('open');
        console.log(`Panel ${panel.classList.contains('front') ? 'front' : panel.classList.contains('back') ? 'back' : panel.classList.contains('left') ? 'left' : 'right'} toggled. Now open: ${panel.classList.contains('open')}`);

        let openCount = 0;
        panels.forEach(p => { if (p.classList.contains('open')) openCount++; });
        console.log('Current number of open panels:', openCount, 'out of', panels.length);

        const allAreOpen = allPanelsOpen();
        console.log('Result of allPanelsOpen():', allAreOpen);
        console.log('Current fireworksPlayed flag:', fireworksPlayed);

        if (!fireworksPlayed && allAreOpen) {
            console.log('SUCCESS: All conditions met! Triggering playFireworks().');
            playFireworks();
            fireworksPlayed = true; 
        } else if (fireworksPlayed && allAreOpen) { 
            console.log('INFO: All panels are open, but fireworks have already been played.');
        } else if (!allAreOpen) {
            console.log('INFO: Not all panels are open yet. Current open count:', openCount);
        }
    });
});



/* =====================================================================
   Rain & GIF 视觉特效  —  FINAL PATCH  © Nikolastar 项目
   ===================================================================== */
(function(){
  /* 重复注入保护 */
  if(window.__rainGif_final_loaded) return;
  window.__rainGif_final_loaded = true;

  /* ---------- 基础元素 ---------- */
  const audio     = document.getElementById('audio');
  const rainLayer = document.getElementById('rain-container') ||
                    createLayer('rain-container');
  const gifLayer  = document.getElementById('gif-fall-container') ||
                    createLayer('gif-fall-container');
  if(!audio) return;

  function createLayer(id){
      const el = document.createElement('div');
      el.id = id;
      el.className = 'effect-layer';
      document.body.appendChild(el);
      return el;
  }

  /* ---------- 1. Rain ----------- */
  let rainTimer=null;
  function startRain(){
      stopRain();
      rainLayer.style.display='block';
      rainLayer.classList.add('active');
      rainTimer=setInterval(()=>{
          const d=document.createElement('div');
          d.className='raindrop';
          d.style.left=Math.random()*100+'vw';
          d.style.setProperty('--spd',(0.5+Math.random()*0.5)+'s');
          rainLayer.appendChild(d);
          d.addEventListener('animationend',()=>d.remove());
      },60);
  }
  function stopRain(){
      clearInterval(rainTimer);
      rainTimer=null;
      rainLayer.classList.remove('active');
      rainLayer.style.display='none';
      rainLayer.innerHTML='';
  }

  /* ---------- 2. GIF 掉落 ---------- */
  let gifRAF=0, balls=[];
  function startGIF(folder){
      stopGIF();
      gifLayer.style.display='block';
      gifLayer.classList.add('active');
      loadGIFList(folder).then(list=>{
          if(!list.length) return;
          const N=Math.min(list.length,24);
          for(let i=0;i<N;i++){
              const file=list[i];
              const img=document.createElement('img');
              img.className='gif-bouncer';
              img.src=`${folder}/${encodeURIComponent(file)}`;
              const s=60+Math.random()*40;
              img.style.width=img.style.height=s+'px';
              img.onload=()=>img.style.visibility='visible';
              img.onerror=()=>img.remove();
              gifLayer.appendChild(img);
              balls.push({
                  el:img,w:s,h:s,
                  x:Math.random()*(innerWidth-s),
                  y:-Math.random()*innerHeight,
                  vx:(Math.random()-.5)*4,
                  vy:Math.random()*2
              });
          }
          animateGIF();
      });
  }
  function animateGIF(){
      const G=.25;
      balls.forEach(b=>{
          b.x+=b.vx; b.y+=b.vy; b.vy+=G;
          if(b.x<=0||b.x+b.w>=innerWidth){b.vx*=-1; b.x=Math.max(0,Math.min(b.x,innerWidth-b.w));}
          if(b.y+b.h>=innerHeight){b.y=innerHeight-b.h; b.vy*=-.82;}
          b.el.style.transform=`translate(${b.x}px,${b.y}px)`;
      });
      gifRAF=requestAnimationFrame(animateGIF);
  }
  function stopGIF(){
      cancelAnimationFrame(gifRAF);
      gifRAF=0; balls.length=0;
      gifLayer.classList.remove('active');
      gifLayer.style.display='none';
      gifLayer.innerHTML='';
  }

  /* —— 自动枚举文件夹里的 GIF —— */
async function loadGIFList(folder){
    /* 1) 先尝试读取目录索引（如 Apache、python -m http.server 可用） */
    try{
        const res = await fetch(folder + '/');
        if(res.ok){
            const html = await res.text();
            const list = [...html.matchAll(/href="([^"]+\.gif)"/gi)]
                         .map(m => decodeURIComponent(m[1]));
            if(list.length) return list;
        }
    }catch{/* 403 / CORS -> 忽略 */ }

    /* 2) 退化：直接返回 1.gif‑40.gif，存在就会显现，不存在 onerror 会被移走 */
    return Array.from({length:40},(_,i)=>`${i+1}.gif`);
}


  /* ---------- 3. 磁盘顺序 → 特效 ---------- */
  const disks=Array.from(document.querySelectorAll('.disk[data-src]'));
  const src2index=new Map(disks.map((d,i)=>[new URL(d.dataset.src,location.href).href,i]));

  function triggerEffect(){
      stopRain(); stopGIF();
      switch(src2index.get(audio.src)){
          case 0: startRain();                    break;   // 第 1 张
          case 1: startGIF('image/gif2');         break;   // 第 2 张
          case 2: startGIF('image/gif3');         break;   // 第 3 张
      }
  }

  audio.addEventListener('play',  triggerEffect);
  audio.addEventListener('pause', ()=>{stopRain();stopGIF();});
  audio.addEventListener('ended', ()=>{stopRain();stopGIF();});
})();
















/* ===== Rain & GIF effects — v2  (APPEND‑ONLY, REPLACES old patches) ===== */
(function(){
  if(window.__rainGif_v2_loaded) return;      // 防止重复注入
  window.__rainGif_v2_loaded = true;

  /* ---------- 基本元素 ---------- */
  const audio = document.getElementById('audio');
  if(!audio) return;

  const rainLayer = document.getElementById('rain-container') ||
                    createLayer('rain-container');
  const gifLayer  = document.getElementById('gif-fall-container') ||
                    createLayer('gif-fall-container');

  function createLayer(id){
    const el = document.createElement('div');
    el.id = id;
    el.className = 'effect-layer';
    document.body.appendChild(el);
    return el;
  }

  /* ---------- 1. Rain ----------- */
  let rainTimer=null;
  function startRain(){
    stopRain();
    rainLayer.classList.add('active');
    rainTimer = setInterval(()=>{
      const d = document.createElement('div');
      d.className = 'raindrop';
      d.style.left = Math.random()*100 + 'vw';
      d.style.setProperty('--spd', (0.5+Math.random()*0.5)+'s');
      rainLayer.appendChild(d);
      d.addEventListener('animationend',()=>d.remove());
    }, 60);
  }
  function stopRain(){
    clearInterval(rainTimer);
    rainTimer = null;
    rainLayer.classList.remove('active');
    rainLayer.innerHTML = '';
  }

  /* ---------- 2. GIF 掉落 ---------- */
  let gifRAF=0, balls=[];
  function startGIF(folder){
    stopGIF();
    gifLayer.classList.add('active');
    loadGIFList(folder).then(list=>{
      if(!list.length) return;                       // 没找到 GIF 就不播
      const N = Math.min(list.length,24);
      for(let i=0;i<N;i++){
        const file = list[i];
        const img  = document.createElement('img');
        img.className = 'gif-bouncer';
        const folderURL = new URL(`${folder}/`, location.href);
        img.src = new URL(file, folderURL).href;
        const size = 60 + Math.random()*40;
        img.style.width = img.style.height = size + 'px';
        img.onload = ()=> img.style.visibility='visible';
        img.onerror= ()=> img.remove();              // 载入失败就删
        gifLayer.appendChild(img);

        balls.push({
          el:img, w:size, h:size,
          x:Math.random()*(innerWidth-size),
          y:-Math.random()*innerHeight,
          vx:(Math.random()-.5)*4,
          vy:Math.random()*2
        });
      }
      animateGIF();
    });
  }
  function animateGIF(){
    const G = .25;
    balls.forEach(b=>{
      b.x+=b.vx; b.y+=b.vy; b.vy+=G;
      if(b.x<=0||b.x+b.w>=innerWidth){b.vx*=-1; b.x=Math.max(0,Math.min(b.x,innerWidth-b.w));}
      if(b.y+b.h>=innerHeight){b.y=innerHeight-b.h; b.vy*=-.82;}
      b.el.style.transform=`translate(${b.x}px,${b.y}px)`;
    });
    gifRAF = requestAnimationFrame(animateGIF);
  }
  function stopGIF(){
    cancelAnimationFrame(gifRAF);
    gifRAF = 0;
    balls.length = 0;
    gifLayer.classList.remove('active');
    gifLayer.innerHTML = '';
  }

  // 获取文件夹内所有 .gif；若服务器不允许目录索引，则回退尝试 1‑80.gif
  async function loadGIFList(folder){
    try{
      const res = await fetch(folder+'/');
      if(res.ok){
        const html = await res.text();
        const files = [...html.matchAll(/href="([^"]+\.gif)"/gi)].map(m=>decodeURIComponent(m[1]));
        if(files.length) return files;
      }
    }catch(e){ /* 可能 403, ignore */ }

    // fallback 按数字探测
    const out=[];
    for(let i=1;i<=80;i++){
      const url = `${folder}/${i}.gif`;
      try{
        const head = await fetch(url,{method:'HEAD'});
        if(head.ok) out.push(`${i}.gif`);
      }catch{}
    }
    return out;
  }

  /* ---------- 3. 唱片索引 → 特效 ---------- */
  const disks = Array.from(document.querySelectorAll('.disk[data-src]'));
  const src2index = new Map(disks.map((d,i)=>[new URL(d.dataset.src,location.href).href,i]));

  function triggerEffect(){
    stopRain(); stopGIF();
    const idx = src2index.get(audio.src);
    if(idx===0) startRain();
    else if(idx===1) startGIF('image/gif2');
    else if(idx===2) startGIF('image/gif3');
  }

  audio.addEventListener('play',  triggerEffect);
  audio.addEventListener('pause', ()=>{stopRain();stopGIF();});
  audio.addEventListener('ended', ()=>{stopRain();stopGIF();});

})();
















/* ======================================================================
   Heart & Fight 小互动  v2  — 持续检测，可恢复 fight 图
   ====================================================================== */
(function(){
  const audio = document.getElementById('audio');
  if(!audio) return;

  /* ---------- 可调整参数 ---------- */
  const HEART_SIZE = 60;                       // heart 宽高 (px)
  const FIGHT_SIZE = 320;                       // fight 图标宽高 (px)
  const FIGHT_POS  = { top:240, left:240 };       // fight 图标左上角坐标
  const TRIGGER_TIME = 10_000;                  // 触发时间 (ms)
  const FALL_SPEED = 2;                         // 下落速度 (px / frame)

  /* ---------- 目录索引 → 第几张唱片 ---------- */
  const disks = Array.from(document.querySelectorAll('.disk[data-src]'));
  const idxMap = new Map(disks.map((d,i)=>[new URL(d.dataset.src,location.href).href,i]));

  /* ---------- 全局句柄 ---------- */
  let heart=null, fight=null;
  let rafFall=0, rafLoop=0, timer=0;
  let targetY = window.innerHeight/2 - HEART_SIZE/2;
  let pos = { x: window.innerWidth/2 - HEART_SIZE/2, y: -HEART_SIZE };

  /* ---------- 创建元素 ---------- */
  function makeHeart(){
      heart = document.createElement('img');
      heart.src = 'image/heart.png';
      heart.className = 'heart-float';
      heart.style.cssText = `
          width:${HEART_SIZE}px; height:auto;
          left:${pos.x}px; top:${pos.y}px;
      `;
      document.body.appendChild(heart);

      window.heartEl = heart;   
  }
  function makeFight(){
      fight = document.createElement('img');
      fight.src = 'image/fight.png';
      fight.className = 'fight-icon';
      fight.style.cssText = `
          width:${FIGHT_SIZE}px;
          top:${FIGHT_POS.top}px; left:${FIGHT_POS.left}px;
          opacity:0;
      `;
      document.body.appendChild(fight);
      requestAnimationFrame(()=>fight.style.opacity='1');

      window.fightEl = fight;          // << 新增

      /* --- 允许 Enter 启动 Sans fight --- */
      window.__enableSansLaunch?.();
  }

  /* ---------- 下落动画 ---------- */
  function fall(){
      pos.y += FALL_SPEED;
      if(pos.y < targetY){
          heart.style.top = pos.y + 'px';
          rafFall = requestAnimationFrame(fall);
      }else{
          pos.y = targetY;
          heart.style.top = targetY + 'px';
          cancelAnimationFrame(rafFall);
          rafFall = 0;
          makeFight();
          enableControl();
      }
  }

  /* ---------- 键盘控制 + 持续碰撞检测 ---------- */
  function enableControl(){
      const step = 15;
      function onKey(e){
          switch(e.key){
              case 'ArrowLeft':  pos.x-=step; break;
              case 'ArrowRight': pos.x+=step; break;
              case 'ArrowUp':    pos.y-=step; break;
              case 'ArrowDown':  pos.y+=step; break;
              default:return;
          }
          pos.x = Math.max(0, Math.min(pos.x, innerWidth-HEART_SIZE));
          pos.y = Math.max(0, Math.min(pos.y, innerHeight-HEART_SIZE));
          heart.style.left = pos.x + 'px';
          heart.style.top  = pos.y + 'px';
      }
      document.addEventListener('keydown', onKey);

      /* gameLoop：每帧检测碰撞，实时更新 fight 图 */
      const loop = ()=>{
          if(!heart || !fight){cancelAnimationFrame(rafLoop); return;}
          const r1 = heart.getBoundingClientRect();
          const r2 = fight.getBoundingClientRect();
          const hit = !(r1.right<r2.left || r1.left>r2.right ||
                        r1.bottom<r2.top || r1.top>r2.bottom);
          fight.src = hit ? 'image/fight1.png' : 'image/fight.png';
          rafLoop = requestAnimationFrame(loop);
      };
      rafLoop = requestAnimationFrame(loop);

      /* 卸载时要移除键盘事件 */
      enableControl.off = ()=>document.removeEventListener('keydown', onKey);
  }

  /* ---------- 启动 / 停止 ---------- */
  function startSeq(){
      stopSeq();                              // 保证无残留
      pos = { x: window.innerWidth/2 - HEART_SIZE/2, y: -HEART_SIZE };
      makeHeart();
      rafFall = requestAnimationFrame(fall);
  }
  function stopSeq(){
      clearTimeout(timer); timer=0;
      cancelAnimationFrame(rafFall); rafFall=0;
      cancelAnimationFrame(rafLoop); rafLoop=0;
      heart?.remove(); heart=null;
      fight?.remove(); fight=null;

      window.heartEl = null;           // << 新增
      window.fightEl = null;           // << 新增
      enableControl.off?.(); enableControl.off=null;

      /* --- 关闭 Sans fight & 监听 --- */
      window.__disableSansLaunch?.();
  }

  /* ---------- 与音频联动 ---------- */
  function onPlay(){
      if(idxMap.get(audio.src) === 2){
          const delay = Math.max(0, TRIGGER_TIME - audio.currentTime*1000);
          timer = setTimeout(startSeq, delay);
      }else stopSeq();
  }
  audio.addEventListener('play',  onPlay);
  audio.addEventListener('pause', stopSeq);
  audio.addEventListener('ended', stopSeq);
})();





























/* ====================================================================
   Sans fight overlay  — heart ∩ fight1 + Enter → 进入游戏
   ==================================================================== */
(function(){
  const audio = document.getElementById('audio');
  if(!audio) return;

  let wrap = null;

  /* ---------- 创建 & 显示 iframe ---------- */
  function showSansFight(){
      if(wrap) return;                             // 已在显示
      audio._prevVol = audio.volume;               // 记录音量
      audio.volume   = 0;                          // 静音

      wrap = document.createElement('div');
      wrap.id = 'sansFrameWrap';
      const frame = document.createElement('iframe');
      frame.src = 'https://jcw87.github.io/c2-sans-fight/';
      wrap.appendChild(frame);
      document.body.appendChild(wrap);

      /* iframe 加载完后，向其窗口发送 2 个 Enter 键，跳过菜单 */
      frame.addEventListener('load', ()=>{
          const enterEv = new KeyboardEvent('keydown',{key:'Enter',keyCode:13,which:13});
          frame.contentWindow.focus();
          frame.contentWindow.dispatchEvent(enterEv);  // 第一次确认默认 Normal
          setTimeout(()=>frame.contentWindow.dispatchEvent(enterEv), 200); // 第二次进入战斗
      });
  }

  /* ---------- 关闭 & 恢复音量 ---------- */
  function hideSansFight(){
      if(!wrap) return;
      wrap.remove();
      wrap = null;
      audio.volume = (audio._prevVol ?? 1);
  }

  /* ---------- 侦听 heart + fight1 + Enter ---------- */
  let onKey = null;
  function armEnterTrigger(){
      if(onKey) return;
      onKey = e=>{
          if(e.key !== 'Enter') return;
          // heartEl/fightEl 已在前面脚本中是全局变量
          if(window.fightEl && window.fightEl.src.endsWith('fight1.png')
             && window.heartEl){
              showSansFight();
          }
      };
      document.addEventListener('keydown', onKey);
  }
  function disarmEnterTrigger(){
      if(onKey){
          document.removeEventListener('keydown', onKey);
          onKey=null;
      }
      hideSansFight();
  }

  /* ---------- Hook 到 Heart/Fight 生命周期 ---------- */
  // 这两个 hook 函数请放到 Heart/Fight 逻辑创建 & 销毁的地方调用
  window.__enableSansLaunch  = armEnterTrigger;
  window.__disableSansLaunch = disarmEnterTrigger;
})();
