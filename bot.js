'use strict';

let util = require('util');
let http = require('http');
let Bot  = require('@kikinteractive/kik');
let sourceFile = require('./config');
// Server Config
const port = 8000;

// Configure the bot API endpoint, details for your bot
let bot = new Bot({
    username: 'gpa.bot',
    apiKey: 'df1e2b51-0391-4852-b008-ba1a8d25cc7e',
    baseUrl: 'https://527fb897.ngrok.io'
});

bot.updateBotConfiguration();
//Events
//Fires when a user talks to the bot for the very first time
bot.onStartChattingMessage((message) => {
    console.log('start');
    bot.getUserProfile(message.from)
        .then((user) => {
            message.reply(`Hey ${user.firstName}!`);
        });
});
bot.onTextMessage((message, bot) => {
    if (message.body == 'help') {
        message.reply('xyz');
    }
    else if (message.body == 'nignog') {
      message.reply('nignog');
    } else {
      message.reply("Ahhhh I don't understand, type 'help' and I can give you a hand");
    }
});

// Set up your server and start listening
let server = http.createServer(bot.incoming());
server.listen(process.env.PORT || port);
console.log("Bot running on port " + port);
