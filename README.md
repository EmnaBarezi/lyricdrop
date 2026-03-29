# LyricDrop

I built LyricDrop because I wanted to create something that goes beyond a typical web application. Instead of just displaying data, I wanted users to actually interact with it in a meaningful way. Music is something everyone connects with, so I thought what if you could test how well you really know the songs you listen to every day?

LyricDrop fetches real song lyrics using an external API and turns them into an interactive guessing game. A word is hidden from a lyric line, and the user has to figure out what it is. It sounds simple, but it genuinely makes you pay attention to lyrics in a way that passive listening never does.

## What the app does

The user types in an artist name and a song title. The app calls the Lyrics.ovh API, fetches the real lyrics for that song, and presents them one line at a time with a missing word. The user guesses the word, earns points, and tries to keep their streak alive without losing all three lives.

Beyond the basic game, the app tracks your performance over time. It saves your best score, your last score, and how many games you have played — all stored locally in your browser so your progress is never lost.

## Features

- Real lyrics fetched live from the Lyrics.ovh API.
- Three difficulty levels that change how the game feels.
- Easy mode hides one short word and shows how many letters it has.
- Medium mode hides one word with no hints.
- Hard mode hides two words in the same line you guess them one at a time.
- Hint button that reveals the first letter of the missing word.
- Skip button if you want to move to the next line.
- Score system with streak bonuses the longer your streak, the more points you earn.
- Three lives per game before it ends.
- Best score, last score, and games played saved in localStorage.
- Recently played history showing your last five songs with scores and accuracy.
- Full error handling for empty inputs, songs not found, and connection issues.

## Why I built it this way

I wanted the app to feel like a real product, not a school exercise. The dark blue design was intentional it feels modern and focused, like a music app should. The difficulty levels were important to me because they make the app accessible to casual users while still being genuinely challenging on Hard mode.

The localStorage feature was something I added because I wanted users to feel like they were building something — a personal record of songs they have played and scores they have achieved.

## API used

This project uses the Lyrics.ovh API to fetch song lyrics in real time.

- API link: https://lyricsovh.docs.apiary.io
- No API key required
- Free and open to use

All credit for the lyrics data goes to the Lyrics.ovh team.

## How to run locally

1. Download or clone this repository
2. Open the project folder on your computer
3. Open index.html in any web browser
4. Type an artist name and a song title
5. Choose a difficulty level
6. Click Start Game and start guessing

No installation, no dependencies, no setup required. It runs entirely in the browser.

## Deployment

The application is deployed on two web servers and a load balancer provided as part of the course infrastructure.

- Web01: http://52.90.113.42
- Web02: http://44.203.115.14
- Load Balancer: https://18.206.140.94

## How I deployed it

I connected to each server using SSH from my local machine. On both Web01 and Web02, I had Nginx already installed. I cloned the GitHub repository directly into the /var/www/html directory on each server, which made Nginx serve the app automatically.

For the load balancer, the server was already running HAProxy with a round-robin configuration pointing to Web01 and Web02. This means every time someone visits the load balancer address, HAProxy decides which server handles the request, distributing the traffic evenly between the two.

I verified the deployment by visiting each server IP directly in the browser and confirming the app loaded and worked correctly on both.

## Challenges I faced

The biggest challenge was the Lyrics.ovh API. It is case sensitive and very specific about song titles, so I had to convert all user input to lowercase before sending the request. Some songs also have very short lyric lines that do not work well for the guessing mechanic, so I added a filter that skips any line shorter than 15 characters.

Building the Hard mode was also tricky because I needed to hide two different words from the same line and then check the user's answers in two separate steps without losing track of which word was which.

The load balancer was already configured on the school infrastructure with HAProxy, so I worked with the existing setup rather than replacing it.

## Credits

- Lyrics data: Lyrics.ovh — https://lyrics.ovh
- Font: Inter by Google Fonts — https://fonts.google.com
- Built with HTML, CSS, and JavaScript — no frameworks or libraries used
  
## Demo Video

https://youtu.be/aCI8PCG-eD8

## Live Deployment

- Web01: http://52.90.113.42
- Web02: http://44.203.115.14
- Load Balancer: https://18.206.140.94

## API Keys

This project uses the Lyrics.ovh API which requires no API key. It is completely free and open to use with no authentication needed.
