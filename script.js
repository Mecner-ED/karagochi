const regulations = {
  "universal": { engine_oil: 15000, timing_belt: 90000 },
  "Volkswagen_Polo_2015": { engine_oil: 15000, timing_belt: 90000 },
  // добавляй новые модели сюда
};

const phrases = {
  oil_overdue: [
    "Масло уже как деготь, ты меня вообще любишь?",
    "Я чувствую, как масло густеет… Это не йогурт, хозяин!",
    "Ещё чуть-чуть — и я начну стучать, как старый дизель."
  ],
  oil_soon: [
    "Масло скоро кончится. Не тяни, а то я начну кашлять!",
    "Эй, до замены масла осталось мало. Запланируй, пожалуйста."
  ],
  belt_overdue: [
    "РЕМЕНЬ НА ПОСЛЕДНЕМ ИЗДЫХАНИИ! Я же не вечный...",
    "Если ремень порвётся — мы с тобой пешком пойдём. Серьёзно."
  ],
  service_done: [
    "О даааа! Новое масло — я как будто в спа съездила! Спасибо ❤️",
    "Ух, свеженькое! Я прям мурлычу мотором от счастья.",
    "Ты лучший хозяин на свете! Обнимаю всеми четырьмя колёсами."
  ],
  good: [
    "Всё в порядке, я счастлива ездить с тобой дальше!",
    "Молодец, что следишь за мной. Продолжай в том же духе 😊"
  ]
};

let car = JSON.parse(localStorage.getItem('karagochi_car')) || null;

function saveCar() {
  const file = document.getElementById('photoInput').files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    car = {
      name: document.getElementById('name').value || 'Моя машина',
      brand: document.getElementById('brand').value,
      model: document.getElementById('model').value,
      year: document.getElementById('year').value,
      mileage: parseInt(document.getElementById('mileage').value),
      photo: e.target.result,
      lastOil: parseInt(document.getElementById('mileage').value),
      lastBelt: 0,
      achievements: [],
      history: []
    };
    localStorage.setItem('karagochi_car', JSON.stringify(car));
    showMain();
  };
  if (file) reader.readAsDataURL(file);
  else {
    car = { ...car, photo: '' }; // если без фото
    reader.onload();
  }
}

function showMain() {
  document.getElementById('onboarding').classList.add('hidden');
  document.getElementById('main').classList.remove('hidden');
  document.getElementById('carName').textContent = car.name;
  document.getElementById('carPhoto').src = car.photo || '';
  updateDisplay();
}

function updateMileage() {
  const newMileage = prompt('Введи текущий пробег (км)', car.mileage);
  if (newMileage && !isNaN(newMileage)) {
    car.mileage = parseInt(newMileage);
    localStorage.setItem('karagochi_car', JSON.stringify(car));
    updateDisplay();
  }
}

function performService(type) {
  const date = new Date().toLocaleDateString('ru-RU');
  car[`last${type}`] = car.mileage;
  car.history.unshift({ date, mileage: car.mileage, type: type === 'Oil' ? 'Замена масла' : 'Ремень ГРМ' });
  
  // ачивки
  if (type === 'Oil' && !car.achievements.includes('Масляный король')) {
    car.achievements.push('Масляный король');
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }
  
  localStorage.setItem('karagochi_car', JSON.stringify(car));
  updateDisplay();
  document.getElementById('moodText').textContent = phrases.service_done[Math.floor(Math.random() * phrases.service_done.length)];
}

function updateDisplay() {
  document.getElementById('currentMileage').textContent = car.mileage;
  document.getElementById('carPhoto').src = car.photo || '';
  
  const key = `${car.brand}_${car.model}_${car.year}`.replace(/ /g, '_');
  const regs = regulations[key] || regulations.universal;
  
  const oilLeft = regs.engine_oil - (car.mileage - car.lastOil);
  const beltLeft = regs.timing_belt - (car.mileage - car.lastBelt);
  
  let nextText = '';
  let buttonsHTML = '';
  if (oilLeft <= beltLeft) {
    nextText = `Масло через ${oilLeft > 0 ? oilLeft : 0} км`;
    buttonsHTML = oilLeft <= 3000 ? `<button onclick="performService('Oil')">Я поменял масло!</button>` : '';
  } else {
    nextText = `Ремень ГРМ через ${beltLeft > 0 ? beltLeft : 0} км`;
    buttonsHTML = beltLeft <= 5000 ? `<button onclick="performService('Belt')">Я поменял ремень!</button>` : '';
  }
  
  document.getElementById('nextService').textContent = nextText;
  document.getElementById('serviceButtons').innerHTML = buttonsHTML;
  
  // настроение и фразы
  let mood = '😊';
  let text = phrases.good[Math.floor(Math.random() * phrases.good.length)];
  if (oilLeft <= 0) { mood = '😣'; text = randomPhrase('oil_overdue'); }
  else if (oilLeft < 3000) { mood = '😬'; text = randomPhrase('oil_soon'); }
  else if (beltLeft <= 0) { mood = '😱'; text = randomPhrase('belt_overdue'); }
  
  document.getElementById('carMood').textContent = mood;
  document.getElementById('moodText').textContent = text;
  
  // здоровье
  const health = Math.clamp(0, 100, 100 - Math.max(0, -oilLeft / 150) - Math.max(0, -beltLeft / 900));
  document.getElementById('healthFill').style.width = health + '%';
  
  // ачивки
  document.getElementById('achievements').innerHTML = car.achievements.map(a => `<div class="achievement">${a}</div>`).join('');
  
  // история
  document.getElementById('historyList').innerHTML = car.history.map(h => `<li>${h.date} — ${h.type} на ${h.mileage} км</li>`).join('');
}

function randomPhrase(key) {
  const arr = phrases[key];
  return arr[Math.floor(Math.random() * arr.length)];
}

Math.clamp = (min, max, val) => Math.min(max, Math.max(min, val));

if (car) showMain();