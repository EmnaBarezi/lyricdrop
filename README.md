# LyricDrop

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![API](https://img.shields.io/badge/Lyrics.ovh-API-brightgreen?style=flat)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat&logo=nginx&logoColor=white)

I built LyricDrop because I wanted to create something that goes beyond a typical web application. Instead of just displaying data, I wanted users to actually interact with it in a meaningful way. Music is something everyone connects with, so I thought what if you could test how well you really know the songs you listen to every day?

LyricDrop fetches real song lyrics using an external API and turns them into an interactive guessing game. A word is hidden from a lyric line, and the user has to figure out what it is. It sounds simple, but it genuinely makes you pay attention to lyrics in a way that passive listening never does.

---

## Demo Video
https://youtu.be/QKR6tCTo0dg

---

## Live Deployment

| Server | Address |
|--------|---------|
| Web01 | http://52.90.113.42 |
| Web02 | http://44.203.115.14 |
| Load Balancer | https://18.206.140.94 |
| GitHub Pages | https://emnabarezi.github.io/lyricdrop/ |

---

## API Keys
This project uses the Lyrics.ovh API which requires no API key. It is completely free and open to use with no authentication needed.

---

## Architecture
```
Users
  |
  v
https://18.206.140.94  (LB01 — HAProxy, round-robin)
        |
   +-----------+
   |           |
Web01        Web02
(Nginx)      (Nginx)
   |           |
   +-----------+
        |
   Static Files
 (HTML + CSS + JS)
        |
  Lyrics.ovh API
```

---

## What the app does

The user types in an artist name and a song title. The app calls the Lyrics.ovh API, fetches the real lyrics for that song, and presents them one line at a time with a missing word. The user guesses the word, earns points, and tries to keep their streak alive without losing all three lives.

Beyond the basic game, the app tracks your performance over time. It saves your best score, your last score, and how many games you have played all stored locally in your browser so your progress is never lost. At the end of every game, the full lyrics of the song are displayed so the user can actually read and learn them.

---

## Features

| Feature | Description |
|---------|-------------|
| Real lyrics | Fetched live from the Lyrics.ovh API |
| Easy mode | One word hidden, letter count shown as a hint |
| Medium mode | One word hidden, no hints |
| Hard mode | Two words hidden, guessed one at a time |
| Hint button | Reveals the first letter of the missing word |
| Skip button | Move to the next line |
| Score system | Points per correct guess plus streak bonuses |
| Lives system | 3 lives per game |
| High score | Best score saved in localStorage |
| Recently played | Last 5 songs with score and accuracy |
| Full lyrics | Complete lyrics shown after each game ends |
| Error handling | Song not found, empty inputs, connection errors |

---

## Why I built it this way

I wanted LyricDrop to feel like something worth using, not just a project to submit. The dark blue design was a deliberate choice I wanted it to feel like a music app, not a school exercise. I also spent time on the difficulty system because I wanted the game to work for everyone. Easy mode is forgiving and gives letter hints, Medium is the standard experience, and Hard mode genuinely challenges you by hiding two words at once.

The localStorage feature came from thinking about what would make someone want to come back. Seeing your best score and your history of played songs makes it feel personal like the app remembers you.

The full lyrics feature was something I added at the end because I wanted the app to be genuinely useful beyond the game itself. After each round, you can read the complete lyrics which turns it into a real learning tool.

---

## API used

This project uses the Lyrics.ovh API to fetch song lyrics in real time.

- API documentation: https://lyricsovh.docs.apiary.io
- No API key required
- Free and open to use

All credit for the lyrics data goes to the Lyrics.ovh team.

---

## How to run locally

1. Clone or download this repository
2. Open the project folder on your computer
3. Open `index.html` in any web browser
4. Type an artist name and a song title
5. Choose a difficulty level
6. Click Start Game and start guessing

No installation, no dependencies, no setup required. It runs entirely in the browser.

---

## Deployment

### Steps to deploy on Web01 and Web02

Connect to the server using SSH:
```bash
ssh -i ~/.ssh/school ubuntu@52.90.113.42
```

Clone the repository into the Nginx web folder:
```bash
sudo git clone https://github.com/EmnaBarezi/lyricdrop /var/www/html
sudo systemctl restart nginx
```

Repeat the same steps for Web02, then verify by visiting each server IP in the browser.

To update the servers after making changes:
```bash
sudo git -C /var/www/html pull
```

### Load Balancer

The load balancer was already running HAProxy on the school infrastructure with a round-robin configuration pointing to Web01 and Web02. Every time someone visits the load balancer address, HAProxy decides which server handles the request, distributing the traffic evenly between the two.

---

## Security

- User input is sanitized using `encodeURIComponent()` before being sent to the API — this protects against URL injection
- No database is used — SQL injection is not possible
- No raw user input is injected into the DOM — XSS attacks are prevented
- No API keys are stored in the repository

---

## Project Structure
```
lyricdrop/
├── index.html      # App structure and layout
├── style.css       # Styling and dark blue design
├── app.js          # Game logic and API integration
├── .gitignore      # Files excluded from the repository
└── README.md       # Project documentation
```

---

## Challenges I faced

The biggest challenge was the Lyrics.ovh API. It is case sensitive and very specific about song titles, so I had to convert all user input to lowercase before sending the request. Some songs also have very short lyric lines that do not work well for the guessing mechanic, so I added a filter that skips any line shorter than 15 characters.

Building the Hard mode was also tricky because I needed to hide two different words from the same line and then check the user answers in two separate steps without losing track of which word was which.

The load balancer was already configured on the school infrastructure with HAProxy, so I worked with the existing setup rather than replacing it.

---

## Credits

| Resource | Link |
|----------|------|
| Lyrics.ovh API | https://lyrics.ovh |
| Inter Font | https://fonts.google.com |
| Nginx | https://nginx.org |

Built with HTML, CSS, and JavaScript — no frameworks or libraries used.

---

*LyricDrop © 2026 — Built by Emna Barezi*
