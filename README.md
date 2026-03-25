# LyricDrop

A web-based music lyric guessing game that uses the Lyrics.ovh API to fetch real song lyrics and turn them into an interactive game experience.

## What it does

LyricDrop fetches real lyrics from any song and hides one word per line. The player must guess the missing word to earn points. The game includes a scoring system, lives, streaks, difficulty levels, and a hint feature.

## Features

- Search any song by artist and title
- Three difficulty levels: Easy, Medium, and Hard
- Score system with streak bonuses
- 3 lives per game
- Hint button that reveals the first letter of the missing word
- Skip button to move to the next line
- High score saved locally
- Recently played history
- Full error handling for invalid songs, empty inputs, and connection issues

## API Used

This project uses the Lyrics.ovh API to fetch song lyrics.
- API Documentation: https://lyricsovh.docs.apiary.io/
- No API key required
- Free and open to use

## How to run locally

1. Download or clone this repository
2. Open the project folder
3. Open index.html in any web browser
4. Type an artist name and song title
5. Select a difficulty level
6. Click Start Game and guess the missing words

## Deployment

### Requirements
- Two web servers: Web01 and Web02
- One load balancer: Lb01

### Steps to deploy on Web01 and Web02

1. Connect to each server using SSH
2. Install Nginx on both servers
3. Copy the project files to /var/www/html/ on both servers
4. Start the Nginx service

### Load Balancer Configuration

The load balancer Lb01 is configured to distribute incoming traffic between Web01 and Web02 using a round-robin method. This ensures the application remains available and handles traffic efficiently.

## Challenges

- The Lyrics.ovh API is case-sensitive so all inputs are converted to lowercase before sending the request
- Some songs have very short lyric lines so the game filters lines shorter than 15 characters
- Difficulty levels required careful word length filtering to ensure fair gameplay

## Credits

- Lyrics data provided by Lyrics.ovh (https://lyrics.ovh)
- Font: Inter by Google Fonts
- Built with HTML, CSS, and JavaScript
