'use strict';

// Always Load
require('dotenv').config();
const Helper = require('disbot-utils');
const Discord = require('discord.js');
// const Discord = Helper['pseudodiscord.js'];
const DEVELOPMENT = process.env.DEVELOPMENT === 'true';

// Dynamic Loads
const imports = Helper.conditionalLoader(DEVELOPMENT, {
  commands: require.resolve('./src/commands.js'),
  utils: require.resolve('./src/utils.js'),
});
imports.staticOnFalse();

// Login
const bot = new Discord.Client();
bot.login(process.env.TOKEN);

// Ready
bot.on('ready', function () {
  console.log('Bot is ready.');
  imports.dynamicOnTrue();

  bot.guilds.map(imports.utils.refreshVoiceRoleState);
});

bot.on('voiceStateUpdate', function (before, after) {
  imports.dynamicOnTrue();

  try {
    imports.utils.applyRemoveVoiceRole(after);
  } catch (err) {
    console.error(err);
  }
});

bot.on('message', function (msg) {
  const commandMatch = Helper
    .validateParseCommand(process.env.PREFIX, Helper.REGEX_SPACE, msg.content);
  if (commandMatch === null) { return; } // Not a valid command format

  imports.dynamicOnTrue();

  const command = commandMatch[1];
  const arg = commandMatch[2] || '';
  // Execute the command
  try {
    if (imports.commands.run(command, arg, msg, bot) == true) {
      // msg.delete(); // Delete if valid command
    } else {
      console.error(`'${command}' returned false or does not exist`);
    }
  } catch (err) {
    console.error(err);
  }
});
//*/

// Fend off sleep timer of five minutes for glitch
const http = require('http');
const express = require('express');
const app = express();
app.get('/', (request, response) => {
  console.log(Date.now() + ' Ping Received');
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 290000);