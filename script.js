// === Bottle-Saver Counter — двойная прокрутка сверху вниз, шаг 500 тыс. ===
// База: ~200 млрд/год => ~6 341.958 шт/сек (365 дней)
const YEAR_TOTAL   = 200_000_000_000;
const SECONDS_YEAR = 365 * 24 * 60 * 60;
const PER_SECOND   = YEAR_TOTAL / SECONDS_YEAR;    // ≈ 6341.958
const PER_MS       = PER_SECOND / 1000;
const STEP         = 500_000;                      // перелистываем каждые полмиллиона

// Стартовое значение по твоему запросу: 500 000
let value        = 500_000;                        // «физическое» число бутылок
let shownBucket  = 500_000;                        // уже показанное кратное STEP
let last         = performance.now();
let animating    = false;
let pendingBucket = null;

const numCurrent = document.getElementById('numCurrent'); // видимый слой
const numNext    = document.getElementById('numNext');    // верхний слой (заезжает сверху)

function formatDisplay(n){
  // показываем «X тыс.» с неразрывными пробелами
  const thousands = (n / 1000).toLocaleString('ru-RU');
  return `${thousands} тыс.`;
}

function setInitial(){
  // current — показанное значение; next — готово сверху
  numCurrent.textContent = formatDisplay(shownBucket);
  numCurrent.className = 'num active';

  numNext.textContent = formatDisplay(shownBucket + STEP);
  numNext.className = 'num above';
}

function animateTo(targetBucket){
  if (animating) return;
  animating = true;

  // Подготовим следующий текст (на верхнем слое)
  numNext.textContent = formatDisplay(targetBucket);

  // Запускаем встречную анимацию: current -> вниз, next -> на место
  numCurrent.classList.remove('active');
  numCurrent.classList.add('below');

  numNext.classList.remove('above');
  numNext.classList.add('active');

  const onDone = () => {
    // Зафиксировали новое показанное значение
    shownBucket = targetBucket;

    // Перекидываем текст и роли: current снова становится активным слоем
    numCurrent.textContent = numNext.textContent;
    numCurrent.className = 'num active';

    // Верхний слой готовим к следующему шагу и прячем сверху
    numNext.textContent = formatDisplay(shownBucket + STEP);
    numNext.className = 'num above';

    animating = false;

    // Если за время анимации накопился ещё шаг — докручиваем
    if (pendingBucket && pendingBucket !== shownBucket){
      const nb = pendingBucket;
      pendingBucket = null;
      // небольшой таймаут — даём браузеру применить классы
      setTimeout(()=>animateTo(nb), 16);
    }
  };

  // Слушаем завершение анимации next (въезжающий слой)
  const handler = () => { numNext.removeEventListener('transitionend', handler); onDone(); };
  numNext.addEventListener('transitionend', handler);
}

function tick(now){
  const dt = now - last;
  last = now;
  value += dt * PER_MS; // непрерывный рост, пока вкладка активна

  const bucket = Math.floor(value / STEP) * STEP;
  if (bucket !== shownBucket){
    if (animating){
      pendingBucket = bucket; // запомним, докрутим после текущей анимации
    } else {
      animateTo(bucket);
    }
  }

  requestAnimationFrame(tick);
}

function init(){
  setInitial();
  requestAnimationFrame(tick);
}
init();

// prefers-reduced-motion — отключаем анимацию, просто обновляем текст
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  const updateNoMotion = () => {
    const bucket = Math.floor(value / STEP) * STEP;
    if (bucket !== shownBucket){
      shownBucket = bucket;
      numCurrent.textContent = formatDisplay(shownBucket);
      numNext.textContent    = formatDisplay(shownBucket + STEP);
    }
    requestAnimationFrame(updateNoMotion);
  };
  updateNoMotion();
}
