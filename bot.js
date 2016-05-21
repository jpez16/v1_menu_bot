//Imports
'use strict';
let util = require('util');
let http = require('http');
let Bot  = require('@kikinteractive/kik');
let config = require('./config');
let apiToken = config.uw_api_token;
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
        let day_dict = {"Monday" : 0, "Tuesday" : 1, "Wednesday" : 2, "Thursday" : 3, "Friday" : 4}
        let msg = message['_state'].body;
        let day = day_dict[msg];
        if (msg == "Monday" || msg == "Tuesday" || msg == "Wednesday" || msg == "Thursday" || msg == "Friday") {
          uwapi.foodservicesMenu().then(function(data) {
            //CHECK FOR 4 DAY WEEK  
            let base_api_data = data['outlets'][0]['menu'];
            if (base_api_date.length < 5){
              //Have to deal with a shortened week.
              console.log(base_api_data);

            }
            //LUNCH
            let lunch = base_api_data[day]['meals']['lunch'];
            let lunch_string = "";
            message.reply("For Lunch on " + msg + ":");
            for (var i = 0; i < lunch.length; i ++) {
              lunch_string += (lunch[i]["product_name"]);
              if (i < lunch.length-1){
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
          message.reply("Please enter a valid day: Monday, Tuesday, Wednesday, Thursday, Friday");
        }
    });
///////////////////////SERVER CONFIG/////////////////////////
let server = http.createServer(bot.incoming());
server.listen(process.env.PORT || config.port);
console.log("Bot running on port " + config.port);
