/* Measure *usable content* after Android applies system-bar/cutout insets. */
(function(){
  const app=document.querySelector('.app');
  const screen=document.getElementById('screen');
  const ring=document.querySelector('.timer-ring');
  const focus=document.querySelector('.under-action');
  let queued=false;
  function layout(){
    queued=false;
    if(!app||!screen||!ring)return;
    const w=screen.clientWidth;
    const h=screen.clientHeight;
    const compact=h<690;
    const tiny=h<560;
    app.classList.toggle('compact',compact);
    app.classList.toggle('tiny',tiny);
    const nav=document.querySelector('.bottom');
    const navHeight=tiny?58:64;
    if(nav&&app.style.getPropertyValue('--nav-height')!==navHeight+'px')app.style.setProperty('--nav-height',navHeight+'px');
    // Re-read the viewport after switching to compact styles or a shorter nav.
    const visible=screen.clientHeight;
    let proposed=Math.min(266,Math.max(144,w*.61),Math.max(142,visible*.35));
    // A large-screen tablet should not produce a giant timer.
    if(w>540)proposed=Math.min(proposed,260);
    let ringSize=Math.round(proposed);
    ring.style.setProperty('--ring-size',ringSize+'px');
    // Keep the start button/test link visible when possible. When not possible,
    // scroll the content rather than shrink touch targets or clip any controls.
    if(document.getElementById('timer').classList.contains('active')){
      const area=screen.getBoundingClientRect();
      const end=focus.getBoundingClientRect().bottom;
      const overflow=Math.max(0,Math.ceil(end-area.bottom+9));
      const minRing=tiny?130:140;
      if(overflow>0&&ringSize>minRing){
        ringSize=Math.max(minRing,ringSize-overflow);
        ring.style.setProperty('--ring-size',ringSize+'px');
      }
    }
  }
  function request(){if(queued)return;queued=true;requestAnimationFrame(layout)}
  window.addEventListener('resize',request,{passive:true});
  window.addEventListener('orientationchange',request,{passive:true});
  if(window.visualViewport)window.visualViewport.addEventListener('resize',request,{passive:true});
  if(window.ResizeObserver){const ro=new ResizeObserver(request);ro.observe(screen);}
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(request);
  const oldSwitch=window.switchTab;
  window.switchTab=function(id){oldSwitch(id);request()};
  const oldUpdate=window.onNativeState;
  window.onNativeState=function(s){oldUpdate(s);request()};
  request();
})();
