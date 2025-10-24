// === Bottle-Saver Counter — прокрутка сверху вниз, непрерывная работа ===
// База: ~200 млрд/год => ~6 341.958 шт/сек (365 дней)
const YEAR_TOTAL   = 200_000_000_000;
const SECONDS_YEAR = 365 * 24 * 60 * 60;
const PER_SECOND   = YEAR_TOTAL / SECONDS_YEAR;     // ≈ 6341.958
const PER_MS       = PER_SECOND / 1000;
const STEP         = 10_000;                        // показываем «десятки тысяч»

const drum = document.getElementById('drum');
const reel = drum.querySelector('.reel');
const numA = document.getElementById('numA'); // верхняя строка (влетает сверху)
const numB = document.getElementById('numB'); // нижняя строка (видна изначально)

let value = 0;                  // накопленное «физическое» значение (шт.)
let last  = performance.now();
let shownBucket   = 0;          // уже показанное кратное STEP (то, что видит пользователь)
let animating     = false;
let pendingBucket = null;       // если за анимацию накопилось ещё — докрутим следом

function toThousands(n){ return (n / 1000).toLocaleString('ru-RU'); }

function prepInitial(){
  // Видимая строка — нижняя (B), верхняя (A) спрятана выше.
  numA.textContent = toThousands(shownBucket + STEP); // следующий шаг спрячем сверху
  numB.textContent = toThousands(shownBucket);        // текущий видимый
  reel.style.transition = 'none';
  reel.style.transform  = 'translateY(-100%)';
  // форсим рефлоу и возвращаем transition
  void reel.offsetHeight;
  reel.style.transition = 'transform .8s cubic-bezier(.22,.65,.22,1)';
}

function rollTo(targetBucket){
  if (animating) return;
  animating = true;

  // Готовим верхнюю строку (A) к новому значению, она сейчас спрятана выше
  numA.textContent = toThousands(targetBucket);

  // Прокручиваем вниз (с -100% до 0%) — A заезжает и занимает место
  reel.style.transform = 'translateY(0%)';

  const onEnd = () => {
    // Теперь A стало видимым значением = targetBucket
    shownBucket = targetBucket;

    // Подготавливаем следующий цикл:
    // — нижняя строка (B) становится «старым» видимым
    numB.textContent = toThousands(shownBucket);

    // — верхняя строка (A) заранее ставится на следующий шаг (shown + STEP)
    numA.textContent = toThousands(shownBucket + STEP);

    // мгновенно возвращаем ленту обратно наверх без анимации (чтобы снова было -100%)
    reel.style.transition = 'none';
    reel.style.transform  = 'translateY(-100%)';
    void reel.offsetHeight; // рефлоу
    reel.style.transition = 'transform .8s cubic-bezier(.22,.65,.22,1)';

    animating = false;

    // Если пока крутили накопилось ещё — крутим сразу дальше
    if (pendingBucket !== null && pendingBucket !== shownBucket){
      const nb = pendingBucket;
      pendingBucket = null;
      // короткая задержка — даём браузеру применить сброс
      setTimeout(() => rollTo(nb), 10);
    }
  };

  reel.addEventListener('transitionend', onEnd, { once:true });
}

function tick(now){
  const dt = now - last;
  last = now;
  value += dt * PER_MS; // растём постоянно, пока вкладка активна

  const bucket = Math.floor(value / STEP) * STEP;
  if (bucket !== shownBucket){
    if (animating){
      pendingBucket = bucket;   // догоняем после текущей анимации
    }else{
      rollTo(bucket);
    }
  }
  requestAnimationFrame(tick);
}

function init(){
  prepInitial();
  requestAnimationFrame(tick);
}
init();

// Уважение prefers-reduced-motion — без прокрутки, просто обновление текста
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  reel.style.transition = 'none';
}
