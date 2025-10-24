// Bottle-Saver Counter
// Анимированный рост числа одноразовых бутылок, которых удалось избежать в РФ.
// Скорость можно настроить по реальной статистике.
const BOTTLES_PER_MIN = 2500; // <- поменяй под официальный источник
const RATE_PER_MS = BOTTLES_PER_MIN / 60000;

const el = document.getElementById('bottleCounter');

let value = 0;
let last = performance.now();

function format(num){
  return Math.floor(num).toLocaleString('ru-RU');
}

function tick(now){
  const dt = now - last;
  last = now;
  value += dt * RATE_PER_MS;
  el.textContent = format(value);
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

// Учитываем prefers-reduced-motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  cancelAnimationFrame(tick);
  setInterval(()=>{
    const now = performance.now();
    const dt = now - last;
    last = now;
    value += dt * RATE_PER_MS;
    el.textContent = format(value);
  }, 500);
}
