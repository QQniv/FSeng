// === Bottle-Saver Counter — плавная барабанная прокрутка без залипаний ===
const YEAR_TOTAL   = 200_000_000_000;
const SECONDS_YEAR = 365 * 24 * 60 * 60;
const PER_SECOND   = YEAR_TOTAL / SECONDS_YEAR;    // ≈ 6341.958
const PER_MS       = PER_SECOND / 1000;
const STEP         = 10_000;                       // показываем «десятки тысяч»

const drum = document.getElementById('drum');
const reel = drum.querySelector('.reel');
const numA = document.getElementById('numA'); // верхняя строка (текущая)
const numB = document.getElementById('numB'); // нижняя строка (следующая)

let value = 0;                  // физическое накопленное число бутылок
let last  = performance.now();
let shownBucket   = 0;          // уже показанное кратное STEP
let animating     = false;
let pendingBucket = null;       // если за время анимации «перескочили» ещё шаг

function toThousands(n){ return (n / 1000).toLocaleString('ru-RU'); }

function prepareNextTexts(currentBucket){
  numA.textContent = toThousands(currentBucket);
  numB.textContent = toThousands(currentBucket + STEP);
}

function rollTo(targetBucket){
  // targetBucket — следующее кратное STEP, которое должно появиться
  animating = true;

  // Запишем «следующее» значение (нижняя строка)
  numB.textContent = toThousands(targetBucket);

  // Прокрутка ленты вверх
  reel.style.transition = 'transform .8s cubic-bezier(.22,.65,.22,1)';
  reel.style.transform  = 'translateY(-100%)';

  const onEnd = () => {
    // Фиксируем новое текущее значение в верхней строке
    numA.textContent = numB.textContent;

    // Мгновенно возвращаем ленту на позицию 0 без анимации
    reel.style.transition = 'none';
    reel.style.transform  = 'translateY(0%)';
    void reel.offsetHeight; // форсим рефлоу

    shownBucket = targetBucket;
    animating = false;

    // Подготовим следующий «шаг» на нижней строке
    numB.textContent = toThousands(shownBucket + STEP);

    // Если во время прокрутки накопилось ещё — крутим сразу дальше
    if (pendingBucket !== null && pendingBucket !== shownBucket){
      const next = pendingBucket;
      pendingBucket = null;
      // небольшой таймаут, чтобы браузер успел применить сброс
      setTimeout(()=> rollTo(next), 10);
    }else{
      // возвращаем стандартный transition для следующего раза
      reel.style.transition = 'transform .8s cubic-bezier(.22,.65,.22,1)';
    }
  };

  reel.addEventListener('transitionend', onEnd, { once:true });
}

function tick(now){
  const dt = now - last;
  last = now;
  value += dt * PER_MS;

  const bucket = Math.floor(value / STEP) * STEP;
  if (bucket !== shownBucket){
    if (animating){
      // запомним последний нужный bucket — докрутим после текущей анимации
      pendingBucket = bucket;
    }else{
      rollTo(bucket);
    }
  }
  requestAnimationFrame(tick);
}

function init(){
  prepareNextTexts(shownBucket);
  requestAnimationFrame(tick);
}
init();

// Уважение prefers-reduced-motion — без анимации
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  reel.style.transition = 'none';
}
