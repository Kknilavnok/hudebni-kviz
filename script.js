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
        "Mezi strunami na kytaře je kromě druhé a třetí struny kde je tercie vždy interval kvarty",
    ]
};

let currentSentence = '';
let words = [];
let correctIndexes = [];
let score = 0;
let streak = 0;
let timer = 0;
let timerInterval;
let hintsRemaining = 3;
let currentDifficulty = 'easy';

function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = streak;
}

function startTimer() {
    clearInterval(timerInterval);
    timer = 0;
    timerInterval = setInterval(() => {
        timer++;
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        document.getElementById('timer').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function changeDifficulty() {
    currentDifficulty = document.getElementById('difficulty').value;
    initializeGame();
}

function showHint() {
    if (hintsRemaining > 0) {
        const dropZone = document.getElementById('dropZone');
        const placedWords = Array.from(dropZone.children);
        const nextCorrectIndex = placedWords.length;
        
        if (nextCorrectIndex < correctIndexes.length) {
            const correctWord = words.find(w => w.index === correctIndexes[nextCorrectIndex]);
            const hintMessage = `The next word should be "${correctWord.word}"`;
            const result = document.getElementById('result');
            result.textContent = hintMessage;
            result.className = 'result';
            hintsRemaining--;
        }
    } else {
        const result = document.getElementById('result');
        result.textContent = 'No hints remaining!';
        result.className = 'result incorrect';
    }
}

function nextSentence() {
    initializeGame();
}

function resetCurrentSentence() {
    const dropZone = document.getElementById('dropZone');
    const wordContainer = document.getElementById('wordContainer');
    
    // Move all words back to word container
    Array.from(dropZone.children).forEach(word => {
        wordContainer.appendChild(word);
    });
    
    // Clear result
    document.getElementById('result').innerHTML = '';
}

function initializeGame() {
    // Select a random sentence from current difficulty
    const availableSentences = sentences[currentDifficulty];
    currentSentence = availableSentences[Math.floor(Math.random() * availableSentences.length)];
    
    // Reset hints
    hintsRemaining = 3;
    
    // Start timer
    startTimer();
    
    // Split into words and create word objects with indexes
    words = currentSentence.split(' ').map((word, index) => ({
        word,
        index
    }));
    
    // Store correct order of indexes
    correctIndexes = words.map(word => word.index);
    
    // Shuffle words
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    
    // Create word elements
    const wordContainer = document.getElementById('wordContainer');
    wordContainer.innerHTML = '';
    
    shuffledWords.forEach(wordObj => {
        const wordElement = document.createElement('div');
        wordElement.className = 'word';
        wordElement.textContent = wordObj.word;
        wordElement.setAttribute('draggable', true);
        wordElement.dataset.index = wordObj.index;
        
        wordElement.addEventListener('dragstart', handleDragStart);
        wordElement.addEventListener('dragend', handleDragEnd);
        
        wordContainer.appendChild(wordElement);
    });
    
    // Clear drop zone
    const dropZone = document.getElementById('dropZone');
    dropZone.innerHTML = '';
    
    // Clear result
    document.getElementById('result').innerHTML = '';
}

function handleDragStart(e) {
    this.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
}

const dropZone = document.getElementById('dropZone');

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const index = e.dataTransfer.getData('text/plain');
    const draggedWord = document.querySelector(`[data-index="${index}"]`);
    
    if (draggedWord) {
        const clone = draggedWord.cloneNode(true);
        draggedWord.remove();
        dropZone.appendChild(clone);
    }
});

function checkOrder() {
    const dropZone = document.getElementById('dropZone');
    const placedWords = Array.from(dropZone.children);
    const currentOrder = placedWords.map(word => parseInt(word.dataset.index));
    
    const result = document.getElementById('result');
    
    if (currentOrder.length !== correctIndexes.length) {
        result.className = 'result incorrect';
        result.textContent = 'Please place all words in the sentence.';
        streak = 0;
        updateStats();
        return;
    }
    
    const isCorrect = currentOrder.every((index, i) => index === correctIndexes[i]);
    
    if (isCorrect) {
        result.className = 'result correct';
        result.textContent = 'Correct! Well done!';
        score += 10 * (currentDifficulty === 'easy' ? 1 : currentDifficulty === 'medium' ? 2 : 3);
        streak++;
        if (streak > 0 && streak % 3 === 0) {
            score += 20; // Bonus for maintaining streak
        }
    } else {
        result.className = 'result incorrect';
        result.textContent = 'Not quite right. Try again!';
        streak = 0;
    }
    
    updateStats();
}

// Initialize the game when the page loads
window.onload = initializeGame;