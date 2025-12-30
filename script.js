const regulations = {
  "universal": { engine_oil: 15000, timing_belt: 90000 },
  "Volkswagen_Polo_2015": { engine_oil: 15000, timing_belt: 90000 },
  // добавляй новые по мере надобности
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
      photo: e.target.result || '',
      lastOil: parseInt(document.getElementById('mileage').value),
      lastBelt: 0,
      achievements: car?.achievements || [],
      history: car?.history || []
    };
    localStorage.setItem('karagochi_car', JSON.stringify(car));
    showMain();
  };
  
  if (file) reader.readAsDataURL(file);
  else reader.onload();
}

function showMain() {
  document.getElementById('onboarding').classList.add('hidden');
  document.getElementById('main').classList.remove('hidden');
  document.getElementById('carName').textContent = car.name;
  updateDisplay();
}

function updateMileage() {
  const newMileage = prompt('Введи текущий пробег (км)', car.mileage);
  if (newMileage !== null && !isNaN(newMileage)) {
    car.mileage = parseInt(newMileage);
    localStorage.setItem('karagochi_car', JSON.stringify(car));
    updateDisplay();
  }
}

function performService(type) {
  const date = new Date().toLocaleDateString('ru-RU');
  const serviceName = type === 'Oil' ? 'Замена масла' : 'Замена ремня ГРМ';
  
  if (type === 'Oil') car.lastOil = car.mileage;
  if (type === 'Belt') car.lastBelt = car.mileage;
  
  car.history.unshift({ date, mileage: car.mileage, type: serviceName });
  
  // простая ачивка за масло
  if (type === 'Oil' && !car.achievements.includes('Масляный король')) {
    car.achievements.push('Масляный король');
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
  }
  
  localStorage.setItem('karagochi_car', JSON.stringify(car));
  updateDisplay();
  
  const textEl = document.getElementById('moodText');
  textEl.textContent = phrases.service_done[Math.floor(Math.random() * phrases.service_done.length)];
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
    if (oilLeft <= 5000) {  // показываем кнопку чуть пораньше
      buttonsHTML = `<button onclick="performService('Oil')">Я поменял масло!</button>`;
    }
  } else {
    nextText = `Ремень ГРМ через ${beltLeft > 0 ? beltLeft : 0} км`;
    if (beltLeft <= 10000) {
      buttonsHTML = `<button onclick="performService('Belt')">Я поменял ремень!</button>`;
    }
  }
  
  document.getElementById('nextService').textContent = nextText;
  document.getElementById('serviceButtons').innerHTML = buttonsHTML;
  
  // настроение
  let mood = '😊';
  let text = phrases.good[Math.floor(Math.random() * phrases.good.length)];
  
  if (oilLeft <= 0) { mood = '😣'; text = randomPhrase('oil_overdue'); }
  else if (oilLeft < 3000) { mood = '😬'; text = randomPhrase('oil_soon'); }
  else if (beltLeft <= 0) { mood = '😱'; text = randomPhrase('belt_overdue'); }
  
  document.getElementById('carMood').textContent = mood;
  document.getElementById('moodText').textContent = text;
  
  // здоровье (заменили Math.clamp на ручной)
  let health = 100;
  if (oilLeft < 0) health += oilLeft / 150;   // минус за просрочку
  if (beltLeft < 0) health += beltLeft / 900;
  health = Math.max(0, Math.min(100, health));
  document.getElementById('healthFill').style.width = health + '%';
  
  // ачивки и история
  document.getElementById('achievements').innerHTML = 
