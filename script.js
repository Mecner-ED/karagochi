const regulations = {
  "Volkswagen_Polo_2015": {
    engine_oil: 15000,
    timing_belt: 90000
  },
  "universal": {
    engine_oil: 15000,
    timing_belt: 80000
  }
};

let car = JSON.parse(localStorage.getItem('karagochi_car')) || null;

function saveCar() {
  car = {
    name: document.getElementById('name').value || 'Моя машина',
    brand: document.getElementById('brand').value,
    model: document.getElementById('model').value,
    year: document.getElementById('year').value,
    mileage: parseInt(document.getElementById('mileage').value),
    lastOil: parseInt(document.getElementById('mileage').value),
    lastBelt: 0
  };
  localStorage.setItem('karagochi_car', JSON.stringify(car));
  showMain();
}

function showMain() {
  document.getElementById('onboarding').classList.add('hidden');
  document.getElementById('main').classList.remove('hidden');
  document.getElementById('carName').textContent = car.name + ' 🚗';
  updateDisplay();
}

function updateMileage() {
  let newMileage = prompt('Введи текущий пробег (км)', car.mileage);
  if (newMileage && !isNaN(newMileage)) {
    car.mileage = parseInt(newMileage);
    localStorage.setItem('karagochi_car', JSON.stringify(car));
    updateDisplay();
  }
}

function updateDisplay() {
  document.getElementById('currentMileage').textContent = car.mileage;
  
  const key = `${car.brand}_${car.model}_${car.year}`.replace(/ /g, '_');
  const regs = regulations[key] || regulations.universal;
  
  const oilLeft = regs.engine_oil - (car.mileage - car.lastOil);
  const beltLeft = regs.timing_belt - (car.mileage - car.lastBelt);
  
  let next = oilLeft < beltLeft ? `Масло через ${oilLeft} км` : `Ремень ГРМ через ${beltLeft} км`;
  let mood = '😊';
  let phrase = '';
  
  if (oilLeft <= 0) {
    mood = '😣';
    phrase = 'Масло уже как деготь! Ты меня вообще любишь?';
  } else if (oilLeft < 3000) {
    mood = '😬';
    phrase = 'Эй, масло скоро кончится. Не тяни, а то я начну кашлять!';
  } else if (beltLeft <= 0) {
    mood = '😱';
    phrase = 'РЕМЕНЬ НА ПОСЛЕДНЕМ ИЗДЫХАНИИ! Я же не вечный...';
  }
  
  document.getElementById('nextService').textContent = next;
  document.getElementById('carMood').textContent = mood;
  document.getElementById('carMood').nextElementSibling.textContent = phrase; // если добавишь <p> под mood
  
  // Здоровье
  const health = Math.max(0, 100 + Math.min(oilLeft / 150, 20) + Math.min(beltLeft / 800, 20) - 20);
  document.getElementById('healthFill').style.width = health + '%';
}

if (car) showMain();