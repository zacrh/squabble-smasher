const axios = require('axios');
const WebSocket = require('ws');
const {v4: uuidv4 } = require('uuid');
const qs = require('qs');

String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

class Squabble {
    constructor(gameMode, displayName, method, security, code, credentials) {
        this.gameMode = gameMode === undefined ? "blitz" : gameMode.toLowerCase() === "blitz" ? "blitz" : "royale";
        this.displayName = displayName;
        this.method = method === undefined ? "find" : method.toLowerCase();
        this.security = security === undefined ? "public" : security.toLowerCase();
        this.code = code === undefined ? "" : code;
        this.credentials = credentials === undefined ? {} : credentials;
        this.idToken = "";
        this.solver = "https://europe-west1-perpetual-pleasure.cloudfunctions.net/wordle-solve?wordlength=5&plurals=true";
        this.key = "AIzaSyA_6U-ZrtypmA7qacuQ2L_GD8NrUTORftI";
        this.headers = {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json",
            "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"99\", \"Google Chrome\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
        };
        this.httpOptions = {
            headers: this.headers,
            //family: 4
        };

        this.init();
    }

    async init() {
        console.log("Creating account...")
        const account = await this.create_account(this.key);
        this.idToken = account.idToken
        console.log("Account created")
        console.log("Changing username to '" + this.displayName + "'...")
        const username = await this.update_account(this.key, this.idToken, this.displayName)
        this.idToken = username.idToken
        console.log("Username changed to '" + this.displayName + "'")
        let game;
        if (this.method === "create") {
            console.log("Creating " + (this.security === "public" ? "public " : "private ") + (this.gameMode === "blitz" ? "blitz" : "squabble royale") + " game...")
            game = await this.create_game(this.idToken, this.gameMode, this.security)
            while (game.data === undefined) {
                console.log("Squabble broke. Trying again...")
                game = await this.create_game(this.idToken, this.gameMode, this.security)
            }
            console.log("Created " + (game.data.isPrivate ? "private " : "public ") + (game.data.type === "blitz" ? "blitz" : "squabble royale") + " game " + game.data.shortCode + " with ID " + game.data.id)
        } else if (this.method === "join") {
            console.log("Finding game with code " + this.code + "...")
            game = await this.join_code(this.idToken, this.code)
            while (game.data === undefined) {
                console.log("Squabble broke. Trying again...")
                game = await this.join_code(this.idToken, this.code)
            }
            console.log("Found " + (game.data.isPrivate ? "private " : "public ") + (game.data.type === "blitz" ? "blitz" : "squabble royale") + " game " + game.data.shortCode + " with ID " + game.data.id)
        } else {
            console.log("Searching for " + (this.gameMode === "blitz" ? "blitz" : "squabble royale") + " game...")
            game = await this.find_game(this.idToken, this.gameMode)
            while (game.data === undefined) {
                console.log("No game found. Trying again...") // No game found (likely means there's no one playing 😔)
                game = await this.find_game(this.idToken, this.gameMode)
            }
            console.log("Found " + (game.data.isPrivate ? "private " : "public ") + (game.data.type === "blitz" ? "blitz" : "squabble royale") + " game " + game.data.shortCode + " with ID " + game.data.id)
        }
        console.log("Joining game " + game.data.shortCode + "...")
        this.join_game(game.data.id, this.idToken, account.localId, game.data.shortCode);
        //console.log(account); // will print your data
        //console.log(token)
    }

    // Creates account (standard guest account, no email required and no username is set. Username is GUEST) 
    async create_account(key) {
        let url = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + key
        try {
            return await axios.post(url, this.httpOptions).then(response => response.data);
        } catch (error) {
            console.log(error.code, error.message, error.response?.status)
            throw {
                code: error.code,
                message: error.message,
                responseStatus: error.response?.status,
                url
            };
        }
    } 

    // Adds email & password and changes usernme - Officially creates the account
    async update_account(key, id_token, username) { 
        let url = "https://identitytoolkit.googleapis.com/v1/accounts:update?key=" + key
        let body = {"email": Object.keys(this.credentials).length === 0 ? (uuidv4() + "@gmail.com") : this.credentials.email, "password": Object.keys(this.credentials).length === 0 ? "password" : this.credentials.password, "displayName": username, "idToken": id_token, "returnSecureToken": true}
        try {
            return await axios.post(url, body, this.httpOptions).then(response => response.data);
        } catch (error) {
            throw {
                code: error.code,
                message: error.message,
                responseStatus: error.response?.status,
                url
            }
        }
    }

    // Gets account info - Returns array of dicts including user's displayName, localId, and account creation/login activity info
    async lookup_account(key, id_token) { 
        let url = "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + key
        let body = {"idToken": id_token}
        try {
            return await axios.post(url, body, this.httpOptions).then(response => response.data);
        } catch (error) {
            throw {
                code: error.code,
                message: error.message,
                responseStatus: error.response?.status,
                url
            };
        }
    }

    // Gets account stats - Returns user's elo and match history in the form of an array of match ids
    async get_account(id_token) { 
        let url = "https://api.squabble.me/users/@me"
        let opts = this.httpOptions
        opts.headers["authorization"] = "Bearer " + id_token
        try {
            return await axios.get(url, opts).then(response => response.data);
        } catch (error) {
            throw {
                code: error.code,
                message: error.message,
                responseStatus: error.response?.status,
                url
            };
        }
    }

    // Refreshes account refresh token - Returns token, and user id info etc.
    async create_token(key, ref_token) { 
        let url = "https://securetoken.googleapis.com/v1/token?key=" + key
        let body = qs.stringify({
            'grant_type': 'refresh_token',
            'refresh_token': ref_token
        })
        try {
            return await axios.post(url, body, { "Content-Type": "application/x-www-form-urlencoded"}).then(response => response.data);
        } catch (error) {
            throw {
                code: error.code,
                message: error.message,
                responseStatus: error.response?.status,
                url
            };
        }
    }

    // Creates game - Gamemode can be either blitz or squabble royale and game can be either private or public
    async create_game(id_token, gameMode, security) { //gameMode: "blitz" or "royale" // security: "private" or "public"
        let priv = security === "public" ? false : true
        let url = "https://api.squabble.me/lobby/create";
        let body = {"type": gameMode, "isPrivate": priv}
        let opts = this.httpOptions
        opts.headers["authorization"] = "Bearer " + id_token
        try {
            return await axios.post(url, body, opts).then(response => response.data);
        } catch (error) {
            throw {
                code: error.code,
                message: error.message,
                responseStatus: error.response?.status,
                url
            };
        }
    }

    // Finds a public game in a specific gameMode.
    async find_game(id_token, gameMode) {
        let url = "https://api.squabble.me/lobby/find"
        let body = {"type": gameMode}
        let opts = this.httpOptions
        opts.headers["authorization"] = "Bearer " + id_token
        try {
            return await axios.post(url, body, opts).then(response => response.data);
        } catch (error) {
            console.log(error.code, error.message, error.response?.status)
            throw {
                code: error.code,
                message: error.message,
                responseStatus: error.response?.status,
                url
            };
        }
    }

    // Joins a public game with a given code.
    async join_code(id_token, code) {
        let url = "https://api.squabble.me/lobby/join/" + code
        let opts = this.httpOptions
        opts.headers["authorization"] = "Bearer " + id_token
        try {
            return await axios.get(url, opts).then(response => response.data);
        } catch (error) {
            console.log(error.code, error.message, error.response?.status)
            throw {
                code: error.code,
                message: error.message,
                responseStatus: error.response?.status,
                url
            };
        }
    }

    replaceAt(str, index, replacement) {
        str = str.split('');
        str[index] = replacement;
        str = str.join('');
        return str
    }

    create_word(word) {
        return JSON.stringify({
            "type": "word",
            "data": {
                "word": word,
                "typing": [
                    [
                        -55,
                        word
                    ]
                ]
            }
        })
    };

    ready = JSON.stringify({
        "type": "ready",
        "data": true
    })

    async get_words(words) {
        let body = words
        let solver = this.solver
        try {
            return await axios.post(this.solver, body, this.httpOptions).then(response => response.data);
        } catch (error) {
            console.log(error.message)
            throw {
                code: error.code,
                message: error.message,
                responseStatus: error.response?.status,
                solver
            };
        }
    }

    join_game(game_id, id_token, local_id, lobby_code) {
        let _this = this;
        let socket = new WebSocket("wss://api.squabble.me/game/" + game_id + "/ws", ["squbbl", id_token]);
        let gameStatus = 0
        let recent_word = []
        let current_word = "crane"
        let suggested = []
        let word_num = 0
        let words = []
        let prev_words = []
        let current_event = ""
        let msg = ""
        let default_words = ["crane", "swift", "godly", "bumph"]
        //let words = {"w": "_____", "v": "_____", "b": "", "old": []}
        let guessed = false
        
        socket.onopen = function(e) {
            console.log("[open] Websocket connection established");
            console.log("Sending 'READY' to server")
            socket.send(_this.ready);
        };

        socket.onmessage = async function(event) {
            //console.log(`[message] Data received from server: ${event.data}`);
            msg = JSON.parse(event.data)
            current_event = msg
            if (gameStatus === 0) {
                gameStatus = msg.type === "state" ? msg.data.public.gameStatus : gameStatus
                console.log("[game] Waiting for game to start...")
                if (gameStatus === 1) {
                    console.log("[game] Game started")
                    socket.send(_this.create_word(current_word));
                    console.log("[" + (words.length + 1) + "] " + "Guess: " + current_word.toUpperCase())
                }
            }
            if (msg.data.player !== undefined && gameStatus === 1) {
                word_num = 0
                recent_word = msg.data.public.playerStates[local_id].history.length === 0 ? [] : msg.data.public.playerStates[local_id].history[msg.data.public.playerStates[local_id].history.length - 1]
                //console.log(recent_word)
                if (recent_word.length === 0 && guessed === true) {
                    guessed = false
                    socket.send(_this.create_word(current_word));
                    console.log("[" + (words.length + 1) + "] " + "Guess: " + current_word.toUpperCase())
                } else if (recent_word.length === 0 && guessed === false) {
                    console.log("[" + (words.length + 1) + "] " + "Failed to find word in 6 guesses. Moving on...")
                    word_num = 0
                    current_word = "crane"
                    suggested = []
                    prev_words.push(words)
                    words = []
                    socket.send(_this.create_word(current_word));
                    console.log("[" + (words.length + 1) + "] " + "Guess: " + current_word.toUpperCase())
                } else {
                    let word = ""
                    let display_word = ""
                    // Old solver
                    for (var i in recent_word) {
                        word = recent_word[i] === 0 ? word + "_" : recent_word[i] === 1 ? word + "?" : word + "+"
                        display_word = recent_word[i] === 0 ? display_word + "⬛" : recent_word[i] === 1 ? display_word + "🟨" : display_word + "🟩"
                    }
                    if (words.length === 6) {
                        console.log("[" + (words.length + 1) + "] " + "Failed to find word in 6 guesses. Moving on...")
                        word_num = 0
                        current_word = "crane"
                        suggested = []
                        words = []
                        prev_words.push(words)
                        word = ""
                    }
                    console.log("[" + (words.length + 1) + "] " + display_word)
                    words.push({"word": current_word, "symbols": word})
                    let t0 = Date.now()
                    if (words.length < 4) {
                        current_word = default_words[words.length]
                    } else {
                        suggested = await _this.get_words(words)
                        suggested = suggested["suggested_words"]
                        current_word = suggested[word_num]
                    }
                    let t1 = Date.now()
                    socket.send(_this.create_word(current_word));
                    console.log("[" + (words.length + 1) + "] " + "Guess: " + current_word.toUpperCase())
                }
            }
            if (msg.data === 0) {
                if (suggested.length === 1) {
                    socket.send(_this.create_word(current_word))
                } else {
                    console.log("[" + (words.length + 1) + "] " + current_word.toUpperCase() + " is an invalid word. Trying next suggested word...")
                    word_num++
                    current_word = suggested[word_num]
                    socket.send(_this.create_word(current_word));
                    console.log("[" + (words.length + 1) + "] " + "Guess: " + current_word.toUpperCase())
                }
            }
            if (msg.data === 4 && msg.eventData === local_id) {
                console.log("[" + (words.length + 1) + "] " + "Found word " + current_word.toUpperCase() + " in " + (words.length + 1) + " guesses")
                word_num = 0
                current_word = "crane"
                suggested = []
                prev_words.push(words)
                words = []
                guessed = true
            }
            if (msg.data === 2 && msg.eventData.id === local_id) {
                console.log("[game] Succesfully joined game " + lobby_code)
            }
            if (msg.data === 2 && msg.eventData.id !== local_id) {
                console.log("[game] User " + msg.eventData.id + " joined game " + lobby_code)
            }
        };
    
        socket.onclose = function(event) {
            if (event.wasClean) {
                console.log("[game] " + "Won game " + lobby_code + ". Watch the replay at https://squabble.me/game/" + game_id + "/replay" )
                console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            } else {
                // e.g. server process killed or network down
                // event.code is usually 1006 in this case
                console.log('[close] Connection died');
            }
        };
    
        socket.onerror = function(error) {
        console.log(`[error] ${error.message}`);
        };
    }
}

module.exports.Squabble = Squabble;