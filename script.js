// === Bottle-Saver Counter — исправленная версия ===
const YEAR_TOTAL = 200_000_000_000;
const SECONDS_YEAR = 365 * 24 * 60 * 60;
const PER_SECOND = YEAR_TOTAL / SECONDS_YEAR; // ~6342/сек
const PER_MS = PER_SECOND / 1000;
const STEP = 10_000;

const drum = document.getElementById('drum');
const reel = drum.querySelector('.reel');
const numA = document.getElementById('numA');
const numB = document.getElementById('numB');

let value = 0;
let last = performance.now();
let shownBucket = 0;
let animating = false;

function toThousands(n){ return (n / 1000).toLocaleString('ru-RU'); }

function rollTo(bucket){
  if (animating) return;
  animating = true;

  numB.textContent = toThousands(bucket);

  // запускаем анимацию прокрутки вверх
  drum.classList.add('roll');

  const onEnd = () => {
    numA.textContent = numB.textContent;
    drum.classList.remove('roll');
    reel.style.transition = 'none';
    reel.style.transform = 'translateY(0%)';
    void reel.offsetHeight; // сброс
    reel.style.transition = '';
    animating = false;
  };

  reel.addEventListener('transitionend', onEnd, { once:true });
}

function tick(now){
  const dt = now - last;
  last = now;
  value += dt * PER_MS;

  const bucket = Math.floor(value / STEP) * STEP;
  if (bucket !== shownBucket){
    shownBucket = bucket;
    rollTo(shownBucket);
  }

  requestAnimationFrame(tick);
}

function init(){
  numA.textContent = toThousands(shownBucket);
  numB.textContent = toThousands(shownBucket + STEP);
  requestAnimationFrame(tick);
}

init();
