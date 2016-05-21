'use strict';

let util = require('util');
let http = require('http');
let Bot  = require('@kikinteractive/kik');
let config = require('./config');

// Configure the bot API endpoint, details for your bot
console.log(config);
let bot = new Bot({
    username: config.bot_name,
    apiKey: config.api_key,
    baseUrl: config.base_url
});
//DEV
bot.send('Bot Active', 'justinpezzack');

bot.updateBotConfiguration();
//Events
//Fires when a user talks to the bot for the very first time
bot.onStartChattingMessage((message) => {
    console.log('New user');
    bot.getUserProfile(message.from)
        .then((user) => {
            message.reply(`Hey ${user.firstName}! I'm GPA Bot, I can help you calculate your Grade Point Average.`);
        });
});
bot.onTextMessage((message, bot) => {
    if (message.body == 'help') {
        message.reply('xyz');
    } else {
      message.reply("Ahhhh I don't understand, type 'help' and I can give you a hand");
    }
});

// Set up your server and start listening
let server = http.createServer(bot.incoming());
server.listen(process.env.PORT || config.port);
console.log("Bot running on port " + config.port);
