// === Bottle-Saver Counter — барабанная прокрутка «десятков тысяч» ===
// База: ~200_000_000_000 бутылок/год => ~6_341.958/сек (365 дней)
const YEAR_TOTAL = 200_000_000_000;
const SECONDS_YEAR = 365 * 24 * 60 * 60;
const PER_SECOND = YEAR_TOTAL / SECONDS_YEAR; // ≈ 6341.958
const PER_MS = PER_SECOND / 1000;

// Размер шага — 10 000 бутылок (на экране отображаем «X тыс.»)
const STEP = 10_000;

const drum = document.getElementById('drum');
const reel = drum.querySelector('.reel');
const numA = document.getElementById('numA'); // верхний (текущий)
const numB = document.getElementById('numB'); // нижний (следующий)

let value = 0;               // физическое накопленное значение (шт.)
let last = performance.now();
let shownBucket = 0;         // текущее показанное кратное STEP
let animating = false;

function toThousands(n){ return (n / 1000).toLocaleString('ru-RU'); }

function rollTo(bucket){
  if (animating) return;
  animating = true;

  // Пишем следующее значение (в тысячах)
  numB.textContent = toThousands(bucket);

  // Запускаем прокрутку
  drum.classList.add('roll');

  const onDone = () => {
    // После анимации: переносим значение вверх, сбрасываем трансформацию
    numA.textContent = numB.textContent;
    drum.classList.remove('roll');
    // моментально возвращаем ленту на место (без видимой анимации)
    reel.style.transition = 'none';
    reel.style.transform = 'translateY(0%)';
    // форсим рефлоу и чистим inline-стили
    void reel.offsetHeight;
    reel.style.transition = '';
    animating = false;
  };

  // ждём окончания CSS-transition
  reel.addEventListener('transitionend', onDone, { once: true });
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
  // Инициализируем первое значение
  numA.textContent = toThousands(shownBucket);
  numB.textContent = toThousands(shownBucket + STEP);
  requestAnimationFrame(tick);
}

init();

// Учитываем prefers-reduced-motion: без анимации, просто обновляем текст
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  drum.classList.remove('roll');
  reel.addEventListener('transitionend', ()=>{}, {once:true}); // no-op
}
