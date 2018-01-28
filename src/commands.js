const utils = require('./utils');
const {Helper, PERMISSION_SELF, _} = utils;

const library = Helper.makeLibrary(() => true, process.env.PREFIX);

// Import the commands
require('./roles')(library, {
  ROLES_COL_THRESHOLD: 60,
  ROLES_MAX_DISPLAY: 99,
  ROLES_MESSAGE_WIDTH: 60,
}, {
  countroles: PERMISSION_SELF,
  whois: PERMISSION_SELF,
});
require('./voice')(library, {
  refreshvoice: PERMISSION_SELF,
  prunevoice: PERMISSION_SELF,
});
require('./langserver')(library, {_}, {
  makelangrole: PERMISSION_SELF,
  listcolorlangs: PERMISSION_SELF,
  assigncolor: PERMISSION_SELF,
});


library.addCommand('ping', ['Regular'],
  '',
  'Should respond with \'pong\'.',
  'Check if the bot is working. Should respond with \'pong\'.',
  PERMISSION_SELF,
  function (parameter, message) {
    message.channel.send('pong');
    return true; // return success
  }
);

library.addCommand('help', ['Regular'],
  ' [<command>]',
  'For seeing the documentation of <command> or all commands',
  `Lists the documentation for each function
  Valid forms are:
  - help
  - help <command>
  eg. **help ping**`,
  PERMISSION_SELF,
  function (parameter, message) {
    const command = parameter.toLowerCase();
    const {channel, author, member} = message;
    // channel, author, member, commandName, strict, combine
    library.defaultHelp(channel, author, member, command, true, true);
    return true;
  }
);

module.exports = library;