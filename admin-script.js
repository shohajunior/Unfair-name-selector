const participantsList = document.getElementById('participantsList');
const allParticipants = document.getElementById('allParticipants');
const selectedDisplay = document.getElementById('selectedDisplay');
const confirmBtn = document.getElementById('confirmBtn');
// НОВЫЕ ЭЛЕМЕНТЫ
const editParticipantsTextarea = document.getElementById('editParticipantsTextarea');
const saveParticipantsBtn = document.getElementById('saveParticipantsBtn');

let selectedWinner = null;

// --- Для работы по сети мы должны читать актуальный список из общего места ---
// Поскольку Python-сервер не поддерживает запись, для редактирования списка
// мы пока оставим старый LOCALSTORAGE (только на вашем компьютере).
// Для выбора победителя это не сработает между компами.

// Load participants from localStorage (ТОЛЬКО ДЛЯ РЕДАКТИРОВАНИЯ)
function loadParticipants() {
    const stored = localStorage.getItem('participants');
    // Используем список по умолчанию, если ничего нет
    if (!stored) {
        const defaultList = ['Jahongir', 'Shoxjahon', 'Jasmina', 'Ruxshona', 'Fayzulloh', 'Mohinur', 'Shoxruz', 'Alixan'];
        localStorage.setItem('participants', JSON.stringify(defaultList));
        return defaultList;
    }
    return JSON.parse(stored);
}

// Function to save participants (ТОЛЬКО В LOCALSTORAGE)
function saveParticipants() {
    const newNames = editParticipantsTextarea.value
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);
        
    if (newNames.length === 0) {
        alert('The list cannot be empty!');
        return;
    }
    
    localStorage.setItem('participants', JSON.stringify(newNames));
    
    // Reload displays
    displayParticipants();
    displayAllParticipants();
    
    alert(`Successfully saved ${newNames.length} participants to LocalStorage. Remember to refresh index.html!`);
}

// Pre-fill the textarea
function fillEditArea() {
    const participants = loadParticipants();
    editParticipantsTextarea.value = participants.join('\n');
}


// Display participants for selection (Берем из LocalStorage)
function displayParticipants() {
    const participants = loadParticipants();
    participantsList.innerHTML = '';
    
    if (participants.length === 0) {
        participantsList.innerHTML = '<p style="text-align: center; color: #999;">No participants found. Add names in the editing section.</p>';
        return;
    }
    
    participants.forEach(participant => {
        const btn = document.createElement('button');
        btn.className = 'participant-btn';
        btn.textContent = participant;
        btn.addEventListener('click', () => selectWinner(participant));
        participantsList.appendChild(btn);
    });
}

// Display all participants (Берем из LocalStorage)
function displayAllParticipants() {
    const participants = loadParticipants();
    allParticipants.innerHTML = '';
    
    if (participants.length === 0) {
        allParticipants.innerHTML = '<p style="text-align: center; color: #999;">No participants yet</p>';
        return;
    }
    
    participants.forEach(participant => {
        const item = document.createElement('div');
        item.className = 'participant-item';
        item.textContent = `• ${participant}`;
        allParticipants.appendChild(item);
    });
}

// Select winner
function selectWinner(participant) {
    selectedWinner = participant;
    const strongElement = selectedDisplay.querySelector('strong');
    if (strongElement) {
        strongElement.textContent = participant;
    } else {
        selectedDisplay.innerHTML = `Selected: <strong>${participant}</strong>`;
    }
    
    document.querySelectorAll('.participant-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.textContent === participant) {
            btn.classList.add('selected');
        }
    });
}

// Confirm and go back (САМЫЙ ВАЖНЫЙ ШАГ ДЛЯ ОБМЕНА МЕЖДУ КОМПАМИ)
confirmBtn.addEventListener('click', () => {
    if (selectedWinner && selectedWinner !== 'None') {
        // Мы НЕ МОЖЕМ использовать fetch POST для записи на простой Python-сервер,
        // поэтому мы просто сохраняем в LocalStorage и переходим на index.html.
        // ЭТО РАБОТАЕТ ТОЛЬКО НА ОДНОМ КОМПЬЮТЕРЕ.
        localStorage.setItem('selectedWinner', selectedWinner);
        window.location.href = 'index.html'; 
    } else {
        alert('Please select a winner first!');
    }
});

// Event listener for saving
saveParticipantsBtn.addEventListener('click', saveParticipants);


// Initialize
function init() {
    selectWinner('None'); 
    fillEditArea(); 
    displayParticipants();
    displayAllParticipants();
}

init();