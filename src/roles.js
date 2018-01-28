const utils = require('./utils');
const {_, Helper} = utils;

function _truncateAndPad(str, targetLength) {
  const trunc = str.length < (targetLength - 1)
    ? str.substr(0, targetLength - 1)
    : str.substr(0, targetLength - 3) + '...';
  return trunc + (new Array(targetLength - trunc.length).join(' '));
}

module.exports = function (library,
  {
    ROLES_COL_THRESHOLD,
    ROLES_MESSAGE_WIDTH,
    ROLES_MAX_DISPLAY,
  }, {
    countroles,
    whois,
  })
{
  library.addCommand('countroles', ['Roles'],
    '',
    'Count the number of roles',
    '    Count the number of roles',
    countroles,
    function (parameter, message) {
      message.channel.send(message.guild.roles.size);
    }
  );

  library.addCommand('whois', ['Regular'],
    'role <fullTitle>',
    'Counts and displays all the members in a table',
    `    Counts everyone in and displays each members' name (up to
    ${ROLES_MAX_DISPLAY} members)`,
    whois,
    function (parameter, message) {
      const {guild, channel} = message;

      // Find valid roles, there might be multiples with the same name
      const roleList = guild.roles.filter(role =>
        role.name.toLowerCase() === parameter.toLowerCase() // Change to fuzzy
      );
    
      const msgs = ((roleList.size === 0)
        ? [`'${parameter}' was not a valid role name.`]
        : roleList.map(function (role) {
          const memberSize = role.members.size;
          const maxIndex = memberSize < ROLES_COL_THRESHOLD ? 1 : 2;
          const columnWidth = Math.floor(ROLES_MESSAGE_WIDTH / (maxIndex + 1));
          const usernames = role.members.map(member => member.user.username);
          
          // console.log('wat face', role.name)
          return `'${role.name}' has ${memberSize} members\n${'```'}${
            _.chain(usernames)(
              _.take(ROLES_MAX_DISPLAY)
              ,_.map(name => _truncateAndPad(name, columnWidth))
              ,_.chunk(maxIndex + 1) // chunk so know where to add newlines

              // undefined from chunk just fizzles from .join()
              ,_.map(row => `${row.join('').trim()}\n`) // make into string
            ).join('')
          }${'```'}`;
        })
      );
      Helper.massMessage(msgs, channel);
      return true;
    }
  );
//*/
};