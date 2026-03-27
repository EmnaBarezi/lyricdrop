let lyrics = [];
let currentLine = 0;
let missingWord = '';
let score = 0;
let streak = 0;
let lives = 3;
let currentArtist = '';
let currentSong = '';
let difficulty = 'medium';
let highScore = 0;
let playHistory = [];

try {
  highScore = localStorage.getItem('lyricdrop_highscore') || 0;
  playHistory = JSON.parse(localStorage.getItem('lyricdrop_history')) || [];
} catch(e) {
  highScore = 0;
  playHistory = [];
}

window.onload = function() {
  document.getElementById('highScore').textContent = highScore;
  renderHistory();
};

window.startGame = async function() {
  console.log('startGame called');

  const artistInput = document.getElementById('artistInput').value.trim();
  const songInput = document.getElementById('songInput').value.trim();
  difficulty = document.getElementById('difficulty').value;

  console.log('Artist:', artistInput, 'Song:', songInput);

  if (!artistInput || !songInput) {
    showError('Please enter both an artist name and a song title.');
    return;
  }

  currentArtist = artistInput;
  currentSong = songInput;

  hideError();
  document.getElementById('gameSection').style.display = 'none';

  const artist = artistInput.toLowerCase();
  const song = songInput.toLowerCase();

  try {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`;
    console.log('Fetching:', url);

    const response = await fetch(url);
    console.log('Response status:', response.status);

    if (!response.ok) {
      showError('Song not found. Try a different artist or song title.');
      return;
    }

    const data = await response.json();
    console.log('Data received:', data);

    if (!data.lyrics || data.lyrics.length < 10) {
      showError('No lyrics found for this song. Try another one.');
      return;
    }

    lyrics = data.lyrics
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 15);

    console.log('Lyrics lines:', lyrics.length);

    if (lyrics.length < 2) {
      showError('Not enough lyrics found. Try a different song.');
      return;
    }

    score = 0;
    streak = 0;
    lives = 3;
    currentLine = 0;

    updateStats();

    document.getElementById('songInfo').innerHTML = `Now playing: <span>${currentArtist}</span> - <span>${currentSong}</span>`;
    document.getElementById('levelDisplay').textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    document.getElementById('gameSection').style.display = 'block';
    document.getElementById('guessRow').style.display = 'flex';

    showQuestion();

  } catch (error) {
    console.log('Error:', error);
    showError('Connection error. Please check your internet and try again.');
  }
};

window.checkGuess = function() {
  const guess = document.getElementById('guessInput').value.trim().toLowerCase().replace(/[^a-z]/g, '');
  if (!guess) return;

  if (guess === missingWord) {
    const points = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 20;
    const bonus = streak * 2;
    score += points + bonus;
    streak++;

    if (score > highScore) {
      highScore = score;
      try { localStorage.setItem('lyricdrop_highscore', highScore); } catch(e) {}
      document.getElementById('highScore').textContent = highScore;
    }

    showFeedback(`✅ Correct! +${points + bonus} points`, 'correct');
  } else {
    lives--;
    streak = 0;
    showFeedback(`❌ Wrong! The word was "${missingWord}"`, 'wrong');
  }

  updateStats();
  currentLine++;
  setTimeout(showQuestion, 1500);
};

window.showHint = function() {
  if (!missingWord) return;
  showFeedback(`Hint: the word starts with "${missingWord[0].toUpperCase()}"`, 'hint');
};

window.skipQuestion = function() {
  streak = 0;
  updateStats();
  showFeedback(`Skipped! The word was "${missingWord}"`, 'wrong');
  currentLine++;
  setTimeout(showQuestion, 1000);
};

window.resetGame = function() {
  score = 0;
  streak = 0;
  lives = 3;
  currentLine = 0;
  lyrics = [];
  missingWord = '';
  updateStats();
  document.getElementById('gameSection').style.display = 'none';
  document.getElementById('artistInput').value = '';
  document.getElementById('songInput').value = '';
  document.getElementById('feedback').textContent = '';
  document.getElementById('guessRow').style.display = 'flex';
};

function getWordsByDifficulty(words) {
  if (difficulty === 'easy') {
    return words.filter(w => w.replace(/[^a-zA-Z]/g, '').length >= 4 && w.replace(/[^a-zA-Z]/g, '').length <= 6);
  } else if (difficulty === 'medium') {
    return words.filter(w => w.replace(/[^a-zA-Z]/g, '').length >= 5 && w.replace(/[^a-zA-Z]/g, '').length <= 8);
  } else {
    return words.filter(w => w.replace(/[^a-zA-Z]/g, '').length >= 7);
  }
}

function showQuestion() {
  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className = 'feedback';

  if (lives <= 0) {
    showGameOver(false);
    return;
  }

  if (currentLine >= lyrics.length) {
    showGameOver(true);
    return;
  }

  const line = lyrics[currentLine];
  let words = line.split(' ').filter(w => w.replace(/[^a-zA-Z]/g, '').length > 3);
  let filteredWords = getWordsByDifficulty(words);

  if (filteredWords.length === 0) {
    currentLine++;
    showQuestion();
    return;
  }

  const randomWord = filteredWords[Math.floor(Math.random() * filteredWords.length)];
  missingWord = randomWord.toLowerCase().replace(/[^a-z]/g, '');

  const display = line.replace(randomWord, '<span class="blank">_ _ _</span>');
  document.getElementById('lyricsCard').innerHTML = `<p>${display}</p>`;
  document.getElementById('guessInput').value = '';
}

function showGameOver(completed) {
  saveHistory();
  document.getElementById('lyricsCard').innerHTML = `
    <div class="game-over">
      <p>${completed ? 'Song completed!' : 'Game over!'} Final score: <strong>${score}</strong></p>
      <button onclick="resetGame()">Play Again</button>
    </div>
  `;
  document.getElementById('guessRow').style.display = 'none';
}

function saveHistory() {
  const entry = {
    artist: currentArtist,
    song: currentSong,
    score: score,
    difficulty: difficulty
  };
  playHistory.unshift(entry);
  if (playHistory.length > 5) playHistory = playHistory.slice(0, 5);
  try { localStorage.setItem('lyricdrop_history', JSON.stringify(playHistory)); } catch(e) {}
  renderHistory();
}

function renderHistory() {
  if (playHistory.length === 0) return;
  document.getElementById('historySection').style.display = 'block';
  const list = document.getElementById('historyList');
  list.innerHTML = '';
  playHistory.forEach(entry => {
    const li = document.createElement('li');
    li.innerHTML = `${entry.artist} - ${entry.song} <span>${entry.score} pts</span>`;
    list.appendChild(li);
  });
}

function showFeedback(msg, type) {
  const fb = document.getElementById('feedback');
  fb.textContent = msg;
  fb.className = `feedback ${type}`;
}

function updateStats() {
  document.getElementById('score').textContent = score;
  document.getElementById('streak').textContent = streak;
  document.getElementById('lives').textContent = lives;
  document.getElementById('highScore').textContent = highScore;
}

function showError(msg) {
  document.getElementById('errorBox').style.display = 'block';
  document.getElementById('errorMsg').textContent = msg;
}

function hideError() {
  document.getElementById('errorBox').style.display = 'none';
}

document.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') checkGuess();
});
