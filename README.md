# Squabble Smasher

Squabble Smasher is a Squabble.me bot written in Node.js. It's effectively a Wordle bot optimized for time complexity instead of guesses. Its goal is to win a Squabble round as fast as possible.

![GIF Demo](img/squabble_demo.gif)

[Link to the replay of the game showcased above.](https://squabble.me/game/5e5ed523bcbc825bb1d630c7742e1f81db358f88578ff4645acf752501a071f1/replay)

## Features

- Supports **existing** Squabble accounts. Just login!
- Finds games **automatically** 🔍
- Supports joining existing games by lobby code
- Supports creating games, both private and public
- Supports **all** gamemodes
    - Blitz ⚡
    - Squabble Royale 👑
- Supports **naming accounts** even if you don't have an existing one to use
- **Progress tracking** in console to see what letters were correct, misplaced, or just not in the word
- Saves a **video replay** 🎬 of the game and outputs the link once the bot wins

## Why?

I, like many, was enthralled with Wordle for the brief period between December 2021 to January 2022. When Ottomated released Squabble.me, a battle royale form of Wordle, it quickly consumed me as it was a fresh and fast-paced way to play Wordle. I soon realized, though, that the strategy was very systematic, making me wonder: what if a computer could do this?

This was my initial thought process when I started this project, but it soon became a fun challenge to tinker with websockets and learn more about how browser games work. This was originally meant to just be a gag I could pull on some of my friends, but I figured it made sense to open-source it now as much of the game's player base has moved on. This was originally written back in February of 2022, shortly after Squabble.me was released.

## How To Use

1. Clone this repository
2. `cd` into the cloned repository
3. Install Node.js & NPM if you haven't already
    - `brew install node` if you're on MacOS
    - Download the [Windows Installer](https://nodejs.org/en/#home-downloadhead) directly from the [nodejs.org](https://nodejs.org) website if you're on Windows
    - `cinst nodejs.install` using Chocolatey
3. Install dependencies using `npm i`
4. Run with `node index.js`

If you're having trouble finding a lobby, it probably just means there aren't any players online. If you still want to see the bot work, just go to [squabble.me](https://squabble.me) and create or find a lobby for yourself. The bot will immediately find and join it.

## How It Works

1. Creates an account at a *public* Squabble.me endpoint.
2. Makes a request to Squabble's API to find a game.
3. Once a game is found, the bot establishes a connection with the lobby's websocket and officially joins the game.
4. When in the game, the bot immediately sends the keystrokes 'READY' to the connected Squabble websocket.
5. When the game starts, Squabble Smasher guesses the same four starting words every time to narrow down possible answers.
6. The bot then makes a request to an open-source Wordle solver with the letter information from the first four guesses to find the correct word. 
7. This process repeats until all opponents are eliminated and the bot wins.

## Todo

- Ability to spawn multiple accounts
- Error handling for when client attempts to join non-existent lobby
- Health bar for bot & other players in the lobby
- Usage statistics
    - Wins
    - Accuracy
    - Avg. time to correctly guess word
    - Common opponents

## Credits

- [Wordle Solver](https://github.com/jason-chao/wordle-solver) by Jason Chao
- [Squabble.me](https://squabble.me) by Ottomated

### Disclaimer

Squabble Smasher is not affiliated with Ottomated or Squabble.me in any capacity.