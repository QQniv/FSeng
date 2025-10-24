// === Bottle-Saver Counter — плавная встречная прокрутка, шаг 500 тыс. ===
const YEAR_TOTAL   = 200_000_000_000;
const SECONDS_YEAR = 365 * 24 * 60 * 60;
const PER_SECOND   = YEAR_TOTAL / SECONDS_YEAR;   // ~6341.958/сек
const PER_MS       = PER_SECOND / 1000;
const STEP         = 500_000;                     // шаг перелистывания

const reel = document.querySelector('.reel');
const numA = document.getElementById('numA'); // текущая
const numB = document.getElementById('numB'); // следующая

let value = 0;
let last  = performance.now();
let shownBucket = 0;
let animating = false;
let pendingBucket = null;

function toThousands(n){ return (n / 1000).toLocaleString('ru-RU') + ' тыс.'; }

function setStates(current, next){
  numA.textContent = toThousands(current);
  numB.textContent = toThousands(next);

  numA.className = 'num active';
  numB.className = 'num next';
}

function rollTo(targetBucket){
  if (animating) return;
  animating = true;

  const nextVal = toThousands(targetBucket);
  numB.textContent = nextVal;

  // подготавливаем классы для анимации
  numA.classList.remove('active');
  numA.classList.add('prev');
  numB.classList.remove('next');
  numB.classList.add('active');

  // ждём окончания transition и меняем роли
  numB.addEventListener('transitionend', ()=>{
    shownBucket = targetBucket;
    // переставляем классы, чтобы следующая итерация начиналась корректно
    numA.textContent = numB.textContent;
    numA.className = 'num active';
    numB.className = 'num next';
    numB.textContent = toThousands(shownBucket + STEP);
    animating = false;

    // если накопился следующий шаг — крутим сразу
    if (pendingBucket && pendingBucket !== shownBucket){
      const nb = pendingBucket;
      pendingBucket = null;
      setTimeout(()=>rollTo(nb),10);
    }
  }, {once:true});
}

function tick(now){
  const dt = now - last;
  last = now;
  value += dt * PER_MS;

  const bucket = Math.floor(value / STEP) * STEP;
  if (bucket !== shownBucket){
    if (animating){
      pendingBucket = bucket;
    } else {
      rollTo(bucket);
    }
  }

  requestAnimationFrame(tick);
}

function init(){
  setStates(shownBucket, shownBucket + STEP);
  requestAnimationFrame(tick);
}

init();
