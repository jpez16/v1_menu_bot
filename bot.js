//Imports
'use strict';
let util = require('util');
let http = require('http');
let Bot  = require('@kikinteractive/kik');
let config = require('./config');
let uwapi = require('uwapi')(config.uw_api_token);
/////////////////API ENDPOINT CONFIG////////////////////////
let bot = new Bot({
    username: config.bot_name,
    apiKey: config.api_key,
    baseUrl: config.base_url
});
bot.updateBotConfiguration();
//bot.send(Bot.Message.text('Hey, nice to meet you!').addResponseKeyboard({
//"type": "text",
//"body": "Suggested text"
//}), 'justinpezzack');

///////////////////////////DEV///////////////////////////////
//bot.send('Bot Active', 'justinpezzack');
console.log(config);
///////////////////////EVENT HANDLERS////////////////////////
//Fires when a user talks to the bot for the very first time
bot.onStartChattingMessage((message) => {
    bot.getUserProfile(message.from)
        .then((user) => {
          bot.getUserProfile(message.from)
          .then((user) => {
              bot.send(Bot.Message.text('Please enter a valid day').addResponseKeyboard(
                [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
              ]), `${user.username}`);
          });
          });
});
//Fires when a user sends a message
bot.onTextMessage((message) => {
        let day_dict = {"Monday" : 0, "Tuesday" : 1, "Wednesday" : 2, "Thursday" : 3, "Friday" : 4}
        let msg = message['_state'].body;
        let day = day_dict[msg];
        if (msg == "Monday" || msg == "Tuesday" || msg == "Wednesday" || msg == "Thursday" || msg == "Friday") {
          uwapi.foodservicesMenu().then(function(data) {
            //CHECK FOR 4 DAY WEEK
            let base_api_data = data['outlets'][0]['menu'];
            if(base_api_data.length < 5){
              //4 Day week
              if(base_api_data[0]['day'] == "Tuesday") {
                day -=1;
                if(msg == "Monday"){
                  message.reply("There is no planned menu for " + msg + ".")
                }
              } else {
                if(msg == "Friday"){
                  message.reply("There is no planned menu for " + msg + ".")
                }
              }
            }
            //LUNCH
            let lunch = base_api_data[day]['meals']['lunch'];
            let lunch_string = "";
            message.reply("For Lunch on " + msg + ":");
            for (var i = 0; i < lunch.length; i ++) {
              lunch_string += (lunch[i]["product_name"]);
              if (i < lunch.length-1) {
                lunch_string += ",\n";
              }
            }
            message.reply(lunch_string);
            //DINNER
            let dinner = base_api_data[day]['meals']['dinner'];
            message.reply("For Dinner on " + msg + ":");
            let dinner_string ="";
            for (var i = 0; i < dinner.length; i ++) {
              dinner_string += (dinner[i]["product_name"]);
              if (i < dinner.length-1){
                dinner_string += ",\n";
              }
            }
            message.reply(dinner_string);
          });
        } else {
          message.reply("Invalid day.");
        }
        bot.getUserProfile(message.from)
        .then((user) => {
            bot.send(Bot.Message.text('Tap a day to see menu:').addResponseKeyboard(
              [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
            ]), `${user.username}`);
        });
    });
///////////////////////SERVER CONFIG/////////////////////////
let server = http.createServer(bot.incoming());
server.listen(process.env.PORT || config.port);
console.log("Bot running on port " + config.port);
