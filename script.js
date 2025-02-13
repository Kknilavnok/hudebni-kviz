// Game data
const sentences = {
    easy: [
        "Kvarta je čistý interval",
        "Prima je čistý interval mezi dvěma stejnými tóny",
        "Tercie je malý a velký interval",
        "Kvinta je čistý interval",
        "Sexta je otočená tercie"
    ],
    medium: [
        "Dominanta je fuknce na pátém stupni",
        "Durová i mollová stupnice mají stejný počet tónů",
        "Harmonická moll má zvýšený sedmý stupeň",
        "Pentatonika má pět tónů",
        "Chromatika má 11 tónů"
    ],
    hard: [
        "Mezi strunami na kytaře je kromě druhé a třetí struny kde je tercie vždy interval kvarty"
    ]
};

// Game state
let currentSentence = '';
let words = [];
let correctIndexes = [];
let score = 0;
let streak = 0;
let timer = 0;
let timerInterval;
let hintsRemaining = 3;
let currentDifficulty = 'easy';

// DOM elements
const elements = {
    score: null,
    streak: null,
    timer: null,
    difficulty: null,
    dropZone: null,
    wordContainer: null,
    result: null
};

// Initialize DOM elements after page load
function initializeElements() {
    elements.score = document.getElementById('score');
    elements.streak = document.getElementById('streak');
    elements.timer = document.getElementById('timer');
    elements.difficulty = document.getElementById('difficulty');
    elements.dropZone = document.getElementById('dropZone');
    elements.wordContainer = document.getElementById('wordContainer');
    elements.result = document.getElementById('result');

    // Add event listeners
    elements.dropZone.addEventListener('dragover', handleDragOver);
    elements.dropZone.addEventListener('dragleave', handleDragLeave);
    elements.dropZone.addEventListener('drop', handleDrop);
    
    if (elements.difficulty) {
        elements.difficulty.addEventListener('change', changeDifficulty);
    }
}

// Update game statistics
function updateStats() {
    if (elements.score) elements.score.textContent = score;
    if (elements.streak) elements.streak.textContent = streak;
}

// Timer functions
function startTimer() {
    clearInterval(timerInterval);
    timer = 0;
    timerInterval = setInterval(() => {
        timer++;
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        if (elements.timer) {
            elements.timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

// Change difficulty level
function changeDifficulty() {
    if (elements.difficulty) {
        currentDifficulty = elements.difficulty.value;
        initializeGame();
    }
}

// Show hint
function showHint() {
    if (hintsRemaining > 0 && elements.dropZone && elements.result) {
        const placedWords = Array.from(elements.dropZone.children);
        const nextCorrectIndex = placedWords.length;
        
        if (nextCorrectIndex < correctIndexes.length) {
            const correctWord = words.find(w => w.index === correctIndexes[nextCorrectIndex]);
            const hintMessage = `The next word should be "${correctWord.word}"`;
            elements.result.textContent = hintMessage;
            elements.result.className = 'result';
            hintsRemaining--;
        }
    } else if (elements.result) {
        elements.result.textContent = 'No hints remaining!';
        elements.result.className = 'result incorrect';
    }
}

// Reset current sentence
function resetCurrentSentence() {
    if (!elements.dropZone || !elements.wordContainer) return;
    
    Array.from(elements.dropZone.children).forEach(word => {
        elements.wordContainer.appendChild(word);
    });
    
    if (elements.result) {
        elements.result.innerHTML = '';
    }
}

// Initialize game
function initializeGame() {
    if (!elements.wordContainer || !elements.dropZone) return;

    const availableSentences = sentences[currentDifficulty];
    currentSentence = availableSentences[Math.floor(Math.random() * availableSentences.length)];
    
    hintsRemaining = 3;
    startTimer();
    
    words = currentSentence.split(' ').map((word, index) => ({
        word,
        index
    }));
    
    correctIndexes = words.map(word => word.index);
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    
    elements.wordContainer.innerHTML = '';
    
    shuffledWords.forEach(wordObj => {
        const wordElement = document.createElement('div');
        wordElement.className = 'word';
        wordElement.textContent = wordObj.word;
        wordElement.setAttribute('draggable', true);
        wordElement.dataset.index = wordObj.index;
        
        wordElement.addEventListener('dragstart', handleDragStart);
        wordElement.addEventListener('dragend', handleDragEnd);
        
        elements.wordContainer.appendChild(wordElement);
    });
    
    elements.dropZone.innerHTML = '';
    if (elements.result) {
        elements.result.innerHTML = '';
    }
}

// Drag and drop handlers
function handleDragStart(e) {
    this.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    if (elements.dropZone) {
        elements.dropZone.classList.add('dragover');
    }
}

function handleDragLeave() {
    if (elements.dropZone) {
        elements.dropZone.classList.remove('dragover');
    }
}

function handleDrop(e) {
    e.preventDefault();
    if (!elements.dropZone) return;
    
    elements.dropZone.classList.remove('dragover');
    const index = e.dataTransfer.getData('text/plain');
    const draggedWord = document.querySelector(`[data-index="${index}"]`);
    
    if (draggedWord) {
        const clone = draggedWord.cloneNode(true);
        draggedWord.remove();
        elements.dropZone.appendChild(clone);
    }
}

// Check word order
function checkOrder() {
    if (!elements.dropZone || !elements.result) return;

    const placedWords = Array.from(elements.dropZone.children);
    const currentOrder = placedWords.map(word => parseInt(word.dataset.index));
    
    if (currentOrder.length !== correctIndexes.length) {
        elements.result.className = 'result incorrect';
        elements.result.textContent = 'Please place all words in the sentence.';
        streak = 0;
        updateStats();
        return;
    }
    
    const isCorrect = currentOrder.every((index, i) => index === correctIndexes[i]);
    
    if (isCorrect) {
        elements.result.className = 'result correct';
        elements.result.textContent = 'Correct! Well done!';
        score += 10 * (currentDifficulty === 'easy' ? 1 : currentDifficulty === 'medium' ? 2 : 3);
        streak++;
        if (streak > 0 && streak % 3 === 0) {
            score += 20; // Bonus for maintaining streak
        }
    } else {
        elements.result.className = 'result incorrect';
        elements.result.textContent = 'Not quite right. Try again!';
        streak = 0;
    }
    
    updateStats();
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    initializeGame();
});