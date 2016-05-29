'use strict';
//get values
let config = require('./config');
let util = require('util');
let http = require('http');
let Bot  = require('@kikinteractive/kik');
let moment = require('moment');
var uwaterlooApi = require('uwaterloo-api');
var uwclient = new uwaterlooApi({
  API_KEY : config.uw_api_token
});
/////////////////API ENDPOINT CONFIG////////////////////////
let bot = new Bot({
    username: config.bot_name,
    apiKey: config.api_key,
    baseUrl: config.base_url
});
bot.updateBotConfiguration();

bot.onStartChattingMessage((message) => {
    bot.getUserProfile(message.from)
        .then((user) => {
              bot.send(Bot.Message.text("Hi I'm V1 Menu Bot! I can show you whats being served in the café! Tap a day to see the menu").addResponseKeyboard(generate_suggested()), `${user.username}`);
        });
    });
//Fires when a user sends a message
bot.onTextMessage((message) => {
        let days_to_show = generate_suggested(); //
        //cleanup raw message from user
        let orig_msg = message['_state'].body.toLowerCase();
        //if msg = 'today' or 'tomorrow' will convert msg to the actual day using moment.js; else msg will pass through the function unmodified
        let msg = generate_day(orig_msg);
        let date_is_valid = false;
        if (!(msg == orig_msg)) {
            date_is_valid = true;
          }
        if (msg.format('dddd') == "Saturday" || msg.format('dddd') == "Sunday") {
          bot.getUserProfile(message.from)
            .then((user) => {
                bot.send(Bot.Message.text('There is no planned menu for '+ msg.format('dddd')+".").addResponseKeyboard(days_to_show), `${user.username}`);
          });
        }
        //date_is_valid == true when we have a valid week day selected
        else if(date_is_valid) {
          //msg is a date object at this point
          let day = (msg.format('e')-1);// starts @ 0 vs moment starts @ 1
          let year = msg.format('YYYY');
          let week = msg.format('d');
          uwclient.get('/foodservices/{year_}/{week_}/menu', {
              year_ : year,
              week_ : week,
          }, function(err, res) {
            //CHECK FOR 4 DAY WEEK
            console.log('parsed');
            let base_api_data = res.data.outlets[0].menu;
            if(base_api_data.length < 5){
              //4 Day week
              if(base_api_data[0]['day'] == "Tuesday") {
                day -=1;
                if(msg.format('dddd') == "Monday"){
                  message.reply("There is no planned menu for " + msg + ".")
                }
              } else {
                if(msg.format('dddd') == "Friday"){
                  message.reply("There is no planned menu for " + msg + ".")
                }
              }
            }
            //BUILD LUNCH
            let lunch = base_api_data[day]['meals']['lunch'];
            let lunch_string = build_lunch_string(lunch);
            message.reply(lunch_string);
            //BUILD DINNER
            let dinner = base_api_data[day]['meals']['dinner'];
            let dinner_string = build_dinner_string(dinner);
            message.reply(dinner_string);
          });
        }
        else if (msg.indexOf('help') > -1) {
          bot.getUserProfile(message.from)
          .then((user) => {
              bot.send(Bot.Message.text('Visit http://justinpezzack.io/v1menubot for help and information').addResponseKeyboard(days_to_show), `${user.username}`);
          });
        } else {
        bot.getUserProfile(message.from)
        .then((user) => {
            bot.send(Bot.Message.text('Tap a day to see a menu').addResponseKeyboard(days_to_show), `${user.username}`);
        });
      }
    });

///////////////////////SERVER CONFIG/////////////////////////
let server = http.createServer(bot.incoming());
server.listen(process.env.PORT || config.port);
console.log("Bot running on port " + config.port);


/////////////////////////////////////////////////////////////
////HELPER FUNCTIONS//////
//generates what to append to
let generate_suggested = function() {
  //if its a weekday reply with defaults
    return ['Today', 'Tomorrow', moment().add(2, 'days').format('dddd'), moment().add(3, 'days').format('dddd'), "Help I'm lost"];
}
let build_lunch_string = function(lunch){
  let lunch_string = "Lunch, 11:30 am - 2:00 pm:\n";
  for (var i = 0; i < lunch.length; i ++) {
    lunch_string += (lunch[i]["product_name"]);
    if (i < lunch.length-1) {
      lunch_string += ",\n";
    }
  }
  return lunch_string;
}
let build_dinner_string = function(dinner) {
  let dinner_string ="Dinner, 4:30 - 8:00 pm:\n";
  for (var i = 0; i < dinner.length; i ++) {
    dinner_string += (dinner[i]["product_name"]);
      if (i < dinner.length-1) {
        dinner_string += ",\n";
      }
  }
  return dinner_string;
}

let generate_day = function(str) {
  if (str.toLowerCase().indexOf('today') > -1)
    return moment();
  else if (str.toLowerCase().indexOf('tomorrow') > -1) {
    return ((moment()).add(1, 'days'));
  }
  else {
    for (var i = 2; i <7; i++ ){
      if(str == moment().add(i, 'days').format('dddd').toLowerCase()) {
        console.log((moment().add(i, 'days')).format('dddd'));
        return (moment().add(i, 'days'));
      }
    }
  }
  return str;
}
