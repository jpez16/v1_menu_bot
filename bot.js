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
              bot.send(Bot.Message.text("Hi I'm V1Menu Bot! I can show you whats being served in the café! Tap a day to see the menu.").addResponseKeyboard(
                [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
              ]), `${user.username}`);
        });
    });
//Fires when a user sends a message
bot.onTextMessage((message) => {
        let week_days =["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        let meals = ["lunch", "dinner"];
        let lunch_asked = false;
        let dinner_asked = false;
        let day_dict = {"Monday" : 0, "Tuesday" : 1, "Wednesday" : 2, "Thursday" : 3, "Friday" : 4};
        let msg = message['_state'].body.toLowerCase();
        var query = false;
        if(msg.indexOf('lunch')>-1) {
          lunch_asked = true;
        }
        else if(msg.indexOf('dinner')>-1) {
          dinner_asked = true;
        }
        else {
          dinner_asked = true;
          lunch_asked = true;
        }
        for (var i =0; i < 5; i++) {
          if (msg.indexOf(week_days[i].toLowerCase()) > -1) {
            query = true;
            msg = week_days[i];
            break;
          }
        }
        //query == true when we have a valid date selected
        if(query) {
          let day = day_dict[msg];
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
            if(lunch_asked){
              let lunch = base_api_data[day]['meals']['lunch'];
              let lunch_string = "Lunch, 11:30 am - 2:00 pm:\n";
              for (var i = 0; i < lunch.length; i ++) {
                lunch_string += (lunch[i]["product_name"]);
                if (i < lunch.length-1) {
                  lunch_string += ",\n";
                }
              }
              message.reply(lunch_string);
            }
            //DINNER
            if(dinner_asked) {
              let dinner = base_api_data[day]['meals']['dinner'];
              let dinner_string ="Dinner, 4:30 - 8:00 pm:\n";
              for (var i = 0; i < dinner.length; i ++) {
                dinner_string += (dinner[i]["product_name"]);
                if (i < dinner.length-1){
                  dinner_string += ",\n";
                }
              }
              message.reply(dinner_string);
            }
          });
        } else {
          message.reply("Invalid day.");
        }
        //hacky but basically forces suggested responses to popup.
        bot.getUserProfile(message.from)
        .then((user) => {
            bot.send(Bot.Message.text('Tap a day to see a menu:').addResponseKeyboard(
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
