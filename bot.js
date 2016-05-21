//Imports
'use strict';
let util = require('util');
let http = require('http');
let Bot  = require('@kikinteractive/kik');
let config = require('./config');
let apiToken = 'f3bf44dd39b2b55a98f0ea49390b157c';
let uwapi = require('uwapi')(apiToken);
uwapi.foodservicesMenu().then(function(data) {
  console.log(data);
});
/////////////////API ENDPOINT CONFIG////////////////////////
let bot = new Bot({
    username: config.bot_name,
    apiKey: config.api_key,
    baseUrl: config.base_url
});
bot.updateBotConfiguration();
///////////////////////////DEV///////////////////////////////
bot.send('Bot Active', 'justinpezzack');
///////////////////////EVENT HANDLERS////////////////////////
//Fires when a user talks to the bot for the very first time
bot.onStartChattingMessage((message) => {
    console.log('New user');
    bot.getUserProfile(message.from)
        .then((user) => {
            message.reply(`Hey ${user.firstName}! Enter a day to find the day's menu (i.e Tuesday)`);
        });
});
//Fires when a user sends a message
bot.onTextMessage((message, bot) => {
    if (message.body == 'Monday' || message.body == 'Tuesday' || message.body == 'Wednesday' || message.body == 'Thursday' || message.body == 'Friday') {
        let menu = uwapi.foodservicesMenu().then(function(data) {
          return data;
        });
        console.log(menu)
    } else {
      message.reply("Ahhhh I don't understand, type 'help' and I can give you a hand");
    }
});
////////////////////////BOT LOGIC////////////////////////////

///////////////////////SERVER CONFIG/////////////////////////
let server = http.createServer(bot.incoming());
server.listen(process.env.PORT || config.port);
console.log("Bot running on port " + config.port);
