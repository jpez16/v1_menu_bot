'use strict';

let util = require('util');
let http = require('http');
let Bot  = require('@kikinteractive/kik');
// Server Config
const port = 8080

// Configure the bot API endpoint, details for your bot
let bot = new Bot({
    username: 'gpa.bot',
    apiKey: 'df1e2b51-0391-4852-b008-ba1a8d25cc7e',
    baseUrl: 'https://kik-echobot.ngrok.io/'
});

bot.updateBotConfiguration();
//Events
bot.onTextMessage((message) => {
    message.reply('wow');
});

// Set up your server and start listening
let server = http.createServer(bot.incoming());
server.listen(process.env.PORT || port);
console.log("Bot running on port " + port);
