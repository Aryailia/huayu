const utils = require('./utils');

module.exports = function (library,
  { refreshvoice,
    prunevoice,
  })
{
  library.addCommand('refreshvoice', ['Admin', 'Voice'],
    '',
    'Assigns or removes the voice role from everyone',
    `    In the automatic handling doesn not work.
    Assigns or removes the voice role from everyone.`,
    refreshvoice,
    function (parameter, message) {
      utils.refreshVoiceRoleState(message.guild);
      return true;
    }
  );

  library.addCommand('prunevoice', ['Admin', 'Voice'],
    '',
    'Removes the voice role from everyone who has it.',
    '    Removes the voice role from everyone who has it. Just in case.',
    prunevoice,
    function (parameter, message) {
      // console.log(utils.getVoiceRoleGuildMembers(message.guild).forEach(member => member.displayName));
      (utils.getVoiceRoleGuildMembers(message.guild)
        .forEach(utils.removeVoiceRole)
      );
      return true;
    }
  );
};