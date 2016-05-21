//Imports
'use strict';
let util = require('util');
let http = require('http');
let Bot  = require('@kikinteractive/kik');
let config = require('./config');
let apiToken = 'f3bf44dd39b2b55a98f0ea49390b157c';
let uwapi = require('uwapi')(apiToken);
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
    bot.getUserProfile(message.from)
        .then((user) => {
            message.reply(`Hey ${user.firstName}! Enter a day to find the day's menu (i.e Tuesday)`);
        });
});
//Fires when a user sends a message
bot.onTextMessage((message, bot) => {
        var day_dict = {"Monday" : 0, "Tuesday" : 1, "Wednesday" : 2, "Thursday" : 3, "Friday" : 4}
        var msg = message['_state'].body;
        var day = day_dct[msg];
        uwapi.foodservicesMenu().then(function(data) {
          message.reply("This is what is for the lunch today:");
          for (var i = 0; i <3; i ++) {
            message.reply(data['outlets'][0]['menu'][day]['meals']['lunch'][i]["product_name"] + "\n");
        }
        });
});
////////////////////////BOT LOGIC////////////////////////////

///////////////////////SERVER CONFIG/////////////////////////
let server = http.createServer(bot.incoming());
server.listen(process.env.PORT || config.port);
console.log("Bot running on port " + config.port);
