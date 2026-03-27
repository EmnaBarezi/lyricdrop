let lyrics = [];
let currentLine = 0;
let missingWord = '';
let missingWord2 = '';
let score = 0;
let streak = 0;
let lives = 3;
let currentArtist = '';
let currentSong = '';
let difficulty = 'medium';
let totalGuesses = 0;
let correctGuesses = 0;
let hardMode = false;
let hardStep = 1;

let highScore = 0;
let gamesPlayed = 0;
let lastScore = 0;
let playHistory = [];

try {
  highScore = parseInt(localStorage.getItem('lyricdrop_highscore')) || 0;
  gamesPlayed = parseInt(localStorage.getItem('lyricdrop_gamesplayed')) || 0;
  lastScore = parseInt(localStorage.getItem('lyricdrop_lastscore')) || 0;
  playHistory = JSON.parse(localStorage.getItem('lyricdrop_history')) || [];
} catch(e) {}

window.onload = function() {
  updateStatsPanel();
  renderHistory();
};

window.startGame = async function() {
  const artistInput = document.getElementById('artistInput').value.trim();
  const songInput = document.getElementById('songInput').value.trim();
  difficulty = document.getElementById('difficulty').value;
  hardMode = difficulty === 'hard';
  hardStep = 1;

  if (!artistInput || !songInput) {
    showError('Please enter both an artist name and a song title.');
    return;
  }

  currentArtist = artistInput;
  currentSong = songInput;
  totalGuesses = 0;
  correctGuesses = 0;

  hideError();
  document.getElementById('gameSection').style.display = 'none';

  try {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artistInput.toLowerCase())}/${encodeURIComponent(songInput.toLowerCase())}`;
    const response = await fetch(url);

    if (!response.ok) {
      showError('Song not found. Try a different artist or song title.');
      return;
    }

    const data = await response.json();

    if (!data.lyrics || data.lyrics.length < 10) {
      showError('No lyrics found for this song. Try another one.');
      return;
    }

    lyrics = data.lyrics
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 15);

    if (lyrics.length < 3) {
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
    document.getElementById('guessInput').placeholder = hardMode ? 'Type first missing word...' : 'Type the missing word...';

    showQuestion();

  } catch (error) {
    showError('Connection error. Please check your internet and try again.');
  }
};

function getWordsByDifficulty(words) {
  if (difficulty === 'easy') {
    return words.filter(w => w.replace(/[^a-zA-Z]/g, '').length >= 3 && w.replace(/[^a-zA-Z]/g, '').length <= 6);
  } else if (difficulty === 'medium') {
    return words.filter(w => w.replace(/[^a-zA-Z]/g, '').length >= 5 && w.replace(/[^a-zA-Z]/g, '').length <= 8);
  } else {
    return words.filter(w => w.replace(/[^a-zA-Z]/g, '').length >= 4);
  }
}

function replaceWordInLine(line, word, replacement) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp('(?<![a-zA-Z])' + escaped + '(?![a-zA-Z])', '');
  return line.replace(regex, replacement);
}

function showQuestion() {
  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className = 'feedback';
  missingWord2 = '';

  if (lives <= 0) {
    showGameOver(false);
    return;
  }

  if (currentLine >= lyrics.length) {
    showGameOver(true);
    return;
  }

  const line = lyrics[currentLine];
  let words = line.split(' ').filter(w => w.replace(/[^a-zA-Z]/g, '').length > 2);
  let filteredWords = getWordsByDifficulty(words);

  if (filteredWords.length === 0) {
    currentLine++;
    showQuestion();
    return;
  }

  if (hardMode && filteredWords.length >= 2) {
    const idx1 = Math.floor(Math.random() * filteredWords.length);
    let idx2 = Math.floor(Math.random() * filteredWords.length);
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * filteredWords.length);
    }

    const word1 = filteredWords[idx1];
    const word2 = filteredWords[idx2];
    missingWord = word1.toLowerCase().replace(/[^a-z]/g, '');
    missingWord2 = word2.toLowerCase().replace(/[^a-z]/g, '');

    let display = replaceWordInLine(line, word1, '|||BLANK1|||');
    display = replaceWordInLine(display, word2, '|||BLANK2|||');
    display = display
      .replace('|||BLANK1|||', '<span class="blank hard">_ _ _</span>')
      .replace('|||BLANK2|||', '<span class="blank hard">_ _ _</span>');

    document.getElementById('lyricsCard').innerHTML = `<p>${display}</p>`;
    document.getElementById('guessInput').placeholder = 'Type first missing word...';
    hardStep = 1;

  } else {
    const randomWord = filteredWords[Math.floor(Math.random() * filteredWords.length)];
    missingWord = randomWord.toLowerCase().replace(/[^a-z]/g, '');

    let blankDisplay;
    if (difficulty === 'easy') {
      blankDisplay = `<span class="blank easy">${'_ '.repeat(missingWord.length).trim()}</span>`;
    } else {
      blankDisplay = `<span class="blank">_ _ _</span>`;
    }

    const display = replaceWordInLine(line, randomWord, blankDisplay);
    document.getElementById('lyricsCard').innerHTML = `<p>${display}</p>`;
  }

  document.getElementById('guessInput').value = '';
}

window.checkGuess = function() {
  const guess = document.getElementById('guessInput').value.trim().toLowerCase().replace(/[^a-z]/g, '');
  if (!guess) return;

  totalGuesses++;

  if (hardMode && missingWord2) {
    if (hardStep === 1) {
      if (guess === missingWord) {
        correctGuesses++;
        showFeedback('✅ First word correct! Now guess the second word.', 'correct');
        hardStep = 2;
        document.getElementById('guessInput').value = '';
        document.getElementById('guessInput').placeholder = 'Type second missing word...';
        return;
      } else {
        lives--;
        streak = 0;
        showFeedback(`❌ Wrong! First word was "${missingWord}"`, 'wrong');
        hardStep = 1;
        updateStats();
        currentLine++;
        setTimeout(showQuestion, 1500);
        return;
      }
    } else {
      if (guess === missingWord2) {
        const points = 20;
        const bonus = streak * 2;
        score += points + bonus;
        streak++;
        correctGuesses++;
        if (score > highScore) {
          highScore = score;
          try { localStorage.setItem('lyricdrop_highscore', highScore); } catch(e) {}
        }
        showFeedback(`✅ Both correct! +${points + bonus} points`, 'correct');
      } else {
        lives--;
        streak = 0;
        showFeedback(`❌ Wrong! Second word was "${missingWord2}"`, 'wrong');
      }
      hardStep = 1;
      updateStats();
      currentLine++;
      setTimeout(showQuestion, 1500);
      return;
    }
  }

  if (guess === missingWord) {
    const points = difficulty === 'easy' ? 5 : 10;
    const bonus = streak * 2;
    score += points + bonus;
    streak++;
    correctGuesses++;
    if (score > highScore) {
      highScore = score;
      try { localStorage.setItem('lyricdrop_highscore', highScore); } catch(e) {}
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
  if (hardMode && hardStep === 2) {
    showFeedback(`Hint: second word starts with "${missingWord2[0].toUpperCase()}"`, 'hint');
  } else {
    showFeedback(`Hint: the word starts with "${missingWord[0].toUpperCase()}"`, 'hint');
  }
};

window.skipQuestion = function() {
  streak = 0;
  hardStep = 1;
  updateStats();
  if (hardMode && missingWord2) {
    showFeedback(`Skipped! Words were "${missingWord}" and "${missingWord2}"`, 'wrong');
  } else {
    showFeedback(`Skipped! The word was "${missingWord}"`, 'wrong');
  }
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
  missingWord2 = '';
  hardStep = 1;
  totalGuesses = 0;
  correctGuesses = 0;
  updateStats();
  document.getElementById('gameSection').style.display = 'none';
  document.getElementById('artistInput').value = '';
  document.getElementById('songInput').value = '';
  document.getElementById('feedback').textContent = '';
  document.getElementById('guessRow').style.display = 'flex';
};

function showGameOver(completed) {
  lastScore = score;
  gamesPlayed++;
  const accuracy = totalGuesses > 0 ? Math.round((correctGuesses / totalGuesses) * 100) : 0;

  try {
    localStorage.setItem('lyricdrop_lastscore', lastScore);
    localStorage.setItem('lyricdrop_gamesplayed', gamesPlayed);
  } catch(e) {}

  saveHistory(accuracy);
  updateStatsPanel();

  document.getElementById('lyricsCard').innerHTML = `
    <div class="game-over">
      <p>${completed ? 'Song completed!' : 'Game over!'}</p>
      <div class="game-over-stats">
        <div class="go-stat"><span>Score</span><strong>${score}</strong></div>
        <div class="go-stat"><span>Accuracy</span><strong>${accuracy}%</strong></div>
        <div class="go-stat"><span>Best</span><strong>${highScore}</strong></div>
      </div>
      <button onclick="resetGame()">Play Again</button>
    </div>
  `;
  document.getElementById('guessRow').style.display = 'none';
}

function updateStatsPanel() {
  if (document.getElementById('statLastScore')) {
    document.getElementById('statLastScore').textContent = lastScore;
    document.getElementById('statBestScore').textContent = highScore;
    document.getElementById('statGamesPlayed').textContent = gamesPlayed;
  }
}

function saveHistory(accuracy) {
  const entry = {
    artist: currentArtist,
    song: currentSong,
    score: score,
    accuracy: accuracy,
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
    li.innerHTML = `${entry.artist} - ${entry.song} <span>${entry.score} pts · ${entry.accuracy}%</span>`;
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
