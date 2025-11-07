window.Player = (function(){
  let audio = new Audio();
  let queue = [];
  let current = null;
  let onUpdate = ()=>{};
  audio.addEventListener('timeupdate', ()=> onUpdate({currentTime: audio.currentTime, duration: audio.duration}));
  audio.addEventListener('ended', ()=> {
    if (queue.length>0) {
      play(queue.shift());
    } else {
      current = null;
      onUpdate({ended:true});
    }
  });

  function play(src, title){
    if (!src) return;
    if (typeof src === 'object') { title = src.title; src = src.src; }
    current = {src, title};
    audio.src = src;
    audio.play();
    onUpdate({playing:true, current, progress:0});
  }
  function pause(){ audio.pause(); onUpdate({playing:false}); }
  function stop(){ audio.pause(); audio.currentTime=0; onUpdate({playing:false, stopped:true}); }
  function seek(percent){
    if (!audio.duration) return;
    audio.currentTime = audio.duration * (percent/100);
  }
  function addToQueue(src){ queue.push(src); }
  function setOnUpdate(fn){ onUpdate = fn; }
  return { play, pause, stop, seek, addToQueue, setOnUpdate, get current(){ return current; }, audio };
})();
