const spinBtn = document.getElementById('spinBtn');
const resetBtn = document.getElementById('resetBtn');
const resultDiv = document.getElementById('result');
const resultText = document.getElementById('resultText');
const namesList = document.getElementById('namesList');

let isSpinning = false;
let selectedWinner = null;
let participants = []; 

// --- АУДИО ЭЛЕМЕНТЫ ---
// Создаем аудиоэлементы, которые можно контролировать
const spinSound = new Audio('spin.mp3'); 
const winSound = new Audio('win.mp3');
// Устанавливаем громкость
spinSound.volume = 0.5; // Слегка тише
winSound.volume = 1.0;  // Полная громкость

// !!! АДРЕС ВАШЕГО СЕРВЕРА: IP 10.10.5.28 и порт 8000 !!!
const API_URL = 'http://10.10.5.28:8000/data.json'; 
const POLLING_INTERVAL = 1000; // Опрос каждую 1 секунду

// --- ФУНКЦИИ ДЛЯ РАБОТЫ С СЕТЬЮ И ОБНОВЛЕНИЯ ДАННЫХ ---

async function fetchData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        const newParticipants = data.participants || [];
        
        // 1. Обновление списка участников
        if (JSON.stringify(participants) !== JSON.stringify(newParticipants)) {
            participants = newParticipants;
            createNameItems(); 

            setTimeout(() => {
                 setActiveItem(4); 
            }, 50); 
        }
        
        // 2. Обновление выбранного победителя
        const newWinner = data.selectedWinner || null;
        if (newWinner && newWinner !== selectedWinner) {
            selectedWinner = newWinner;
            console.log("New winner received:", selectedWinner);
        }
        
    } catch (error) {
        console.warn("Could not fetch data from server. Check server connection.", error.message);
        if (participants.length === 0 || participants[0] !== 'Check Server') {
            participants = ['Error loading names', 'Check Server'];
            createNameItems();
        }
    }
}

// Запуск опроса (Polling)
function startPolling() {
    fetchData(); 
    setInterval(fetchData, POLLING_INTERVAL); 
}

// --- ОСНОВНЫЕ ФУНКЦИИ ---

function createNameItems() {
    namesList.innerHTML = '';
    
    if (participants.length === 0) {
        namesList.innerHTML = '<div class="name-item active">NO DATA</div>';
        return;
    }
    
    const totalItems = 300; 
    for (let i = 0; i < totalItems; i++) {
        const item = document.createElement('div');
        item.className = 'name-item';
        if (i === 4) item.classList.add('active');
        item.textContent = participants[i % participants.length]; 
        item.id = `name-${i}`;
        namesList.appendChild(item);
    }
    
    scrollToIndex(4); 
}

function setActiveItem(index) {
    document.querySelectorAll('.name-item').forEach(item => {
        item.classList.remove('active');
        item.classList.remove('winner');
    });
    const activeItem = document.getElementById(`name-${index}`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

function scrollToIndex(index) {
    const items = document.querySelectorAll('.name-item');
    if (items.length === 0) return;
    
    const targetElement = items[index];
    const container = namesList.parentElement;
    
    const containerCenter = container.offsetWidth / 2;
    const elementCenter = targetElement.offsetLeft + targetElement.offsetWidth / 2;
    const scrollAmount = elementCenter - containerCenter;
    
    namesList.style.transform = `translateX(-${scrollAmount}px)`;
}

// Spin function
function spin() {
    if (isSpinning) return;
    if (!selectedWinner) {
        alert('Please wait for the Admin to set a winner in data.json!');
        return;
    }
    
    if (participants.length === 0) {
        alert('No participants loaded!');
        return;
    }
    
    isSpinning = true;
    spinBtn.disabled = true;
    resultDiv.classList.add('hidden');
    
    // --- ЗВУК ВРАЩЕНИЯ: Запуск ---
    spinSound.currentTime = 0; // Начинаем с начала
    spinSound.loop = true;      // Включаем повтор на время вращения
    spinSound.play().catch(e => console.error("Error playing spin sound:", e)); // Запускаем

    const totalDuration = 8000;
    const startTime = performance.now();
    const winnerIndexInParticipants = participants.indexOf(selectedWinner);
    
    if (winnerIndexInParticipants === -1) {
        alert(`Selected winner "${selectedWinner}" not found in current list!`);
        isSpinning = false;
        spinBtn.disabled = false;
        // --- Остановка звука в случае ошибки ---
        spinSound.pause();
        spinSound.loop = false;
        return;
    }
    
    const loops = 15;
    const itemsToScroll = loops * participants.length + winnerIndexInParticipants - 4;

    function animateSpin(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / totalDuration, 1);
        
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentIndex = Math.floor(itemsToScroll * easeProgress);
        scrollToIndex(currentIndex);
        
        if (progress < 1) {
            requestAnimationFrame(animateSpin);
        } else {
            // --- ЗВУК ВРАЩЕНИЯ: Остановка и ЗВУК ПОБЕДЫ: Запуск ---
            spinSound.pause();
            spinSound.loop = false;
            winSound.play().catch(e => console.error("Error playing win sound:", e));

            isSpinning = false;
            spinBtn.disabled = false;
            showResult(selectedWinner);
            selectedWinner = null; 
        }
    }
    
    requestAnimationFrame(animateSpin);
}

// Show result
function showResult(participant) {
    resultText.textContent = participant;
    resultDiv.classList.remove('hidden');
    resultDiv.classList.add('visible');
    
    setTimeout(() => {
        const activeItem = document.querySelector('.name-item.active');
        if (activeItem) {
            activeItem.classList.add('winner');
        }
    }, 100);
    
    createConfetti();
}

// Create confetti
function createConfetti() {
    const confettiPieces = ['🎉', '🎊', '✨', '⭐', '🌟', '💫', '🎈', '🎁'];
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.textContent = confettiPieces[Math.floor(Math.random() * confettiPieces.length)];
            piece.style.left = Math.random() * 100 + '%';
            piece.style.top = '-50px';
            piece.style.opacity = '1';
            
            document.body.appendChild(piece);
            setTimeout(() => piece.remove(), 3000);
        }, i * 30);
    }
}

// Reset
function reset() {
    isSpinning = false;
    spinBtn.disabled = false;
    resultDiv.classList.add('hidden');
    namesList.style.transform = 'translateX(0)';
    setActiveItem(4);
    document.querySelectorAll('.name-item.winner').forEach(item => item.classList.remove('winner'));
}

// Event listeners
spinBtn.addEventListener('click', spin);
resetBtn.addEventListener('click', reset);

// Initialize
function init() {
    createNameItems(); 
    startPolling(); 
    setTimeout(() => {
        setActiveItem(4);
    }, 50);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}