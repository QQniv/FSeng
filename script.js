// === Bottle-Saver Counter — двойная прокрутка сверху вниз, шаг 500 тыс. ===
const YEAR_TOTAL   = 200_000_000_000;
const SECONDS_YEAR = 365 * 24 * 60 * 60;
const PER_SECOND   = YEAR_TOTAL / SECONDS_YEAR;    // ≈ 6341.958
const PER_MS       = PER_SECOND / 1000;
const STEP         = 500_000;                      // перелистывание каждые полмиллиона

// Стартовое значение по запросу
let value       = 500_000;                         // «физическое» число бутылок
let shownBucket = 500_000;                         // показанное кратное STEP
let last        = performance.now();
let animating   = false;
let pendingBucket = null;

const drum       = document.getElementById('drum');
const numCurrent = document.getElementById('numCurrent'); // видимый слой
const numNext    = document.getElementById('numNext');    // верхний слой (заезжает сверху)

function formatDisplay(n){
  const thousands = (n / 1000).toLocaleString('ru-RU');
  return `${thousands} тыс.`;
}

// подгоняем ширину барабана под самое длинное из двух значений
function adjustDrumWidth(){
  // временно сделаем элементы видимыми для замера
  const w1 = measureWidth(numCurrent);
  const w2 = measureWidth(numNext);
  const w  = Math.max(w1, w2);
  drum.style.width = w + 'px';
}

function measureWidth(el){
  const clone = el.cloneNode(true);
  clone.style.position = 'absolute';
  clone.style.visibility = 'hidden';
  clone.style.opacity = '0';
  clone.className = 'num active'; // чтобы был в естественном положении
  drum.appendChild(clone);
  const w = clone.getBoundingClientRect().width;
  drum.removeChild(clone);
  return w;
}

function setInitial(){
  numCurrent.textContent = formatDisplay(shownBucket);
  numCurrent.className   = 'num active';

  numNext.textContent = formatDisplay(shownBucket + STEP);
  numNext.className   = 'num above';

  adjustDrumWidth();
}

function animateTo(targetBucket){
  if (animating) return;
  animating = true;

  // готовим верхний слой к новому значению
  numNext.textContent = formatDisplay(targetBucket);
  adjustDrumWidth();

  // встречная анимация
  numCurrent.classList.remove('active'); numCurrent.classList.add('below');
  numNext.classList.remove('above');     numNext.classList.add('active');

  const onDone = () => {
    shownBucket = targetBucket;

    // меняем роли
    numCurrent.textContent = numNext.textContent;
    numCurrent.className = 'num active';

    numNext.textContent = formatDisplay(shownBucket + STEP);
    numNext.className = 'num above';

    animating = false;

    if (pendingBucket && pendingBucket !== shownBucket){
      const nb = pendingBucket;
      pendingBucket = null;
      setTimeout(()=>animateTo(nb), 16);
    }
  };

  numNext.addEventListener('transitionend', function handler(e){
    if (e.propertyName !== 'transform') return;
    numNext.removeEventListener('transitionend', handler);
    onDone();
  });
}

function tick(now){
  const dt = now - last;
  last = now;
  value += dt * PER_MS; // непрерывный рост пока вкладка активна

  const bucket = Math.floor(value / STEP) * STEP;
  if (bucket !== shownBucket){
    if (animating){
      pendingBucket = bucket;
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

// prefers-reduced-motion — без анимации, просто обновление текста
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  const updateNoMotion = () => {
    const dt = performance.now() - last;
    last += dt;
    value += dt * PER_MS;
    const bucket = Math.floor(value / STEP) * STEP;
    if (bucket !== shownBucket){
      shownBucket = bucket;
      numCurrent.textContent = formatDisplay(shownBucket);
      numNext.textContent    = formatDisplay(shownBucket + STEP);
      adjustDrumWidth();
    }
    requestAnimationFrame(updateNoMotion);
  };
  updateNoMotion();
}
