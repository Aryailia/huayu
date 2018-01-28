const ROLE_INCLUDE_PREFIXES = ['Learning', 'Heritage', 'Fluent', 'Native'];
const ROLE_IGNORE_SUFFIX = [
  'Cantonese', 'Mandarin',
  'English', 'Manglish', 'Singlish',
  'Other', 'Classical Chinese'
];
const prefixes = ROLE_INCLUDE_PREFIXES.join(', ');

const ROLE_PROFILE = {
  [ROLE_INCLUDE_PREFIXES[0]]: { // Learning
    permissions: ['CONNECT'],
    hoist: false
  },
  [ROLE_INCLUDE_PREFIXES[1]]: { // Heritage
    permissions: ['CONNECT'],
    hoist: false
  },
  [ROLE_INCLUDE_PREFIXES[2]]: { // Fluent
    permissions: ['CONNECT'],
    hoist: false
  },
  [ROLE_INCLUDE_PREFIXES[3]]: { // Native
    permissions: ['CONNECT'],
    hoist: true
  },
};

const startWithPrefix = name => true === ROLE_INCLUDE_PREFIXES.some(prefix =>
  name.startsWith(prefix));
const dontHaveSuffix = name => false === ROLE_IGNORE_SUFFIX.some(suffix =>
  name.toLowerCase().endsWith(suffix.toLowerCase()));

module.exports = function (library, {_},
  { makelangrole,
    listcolorlangs,
    assigncolor,
  })
{
  function _getColoringLanguageRoles(guild) {
    const roleNames = guild.roles.map(role => role.name);
    const languages = _.chain(roleNames)(
      _.sieve(startWithPrefix)
      ,_.sieve(dontHaveSuffix)
      ,_.map(_extractLanguage) // Get language name half
      ,_.unique()
      ,_.unmonad(Array.prototype.sort)
    );
    return languages;
  }

  function _extractLanguage(name) {
    return name.match(/.+? (.+)/)[1];
  }


  // Creates a no permission role
  // Doesn't affect permissions of use external emoji and add reactions
  // Todo: add error priting for failure and what not
  library.addCommand('makelangrole', ['Admin', 'Role'],
    ' [<perimssionMask>]',
    'Adds a role with <permissionMask> permission level. <permissionMask> must be a number.',
    `    If nothing is specified for <permissionMask>, then it copies @ everyone
    Can also specify guild flag coming soon (TM)`,
    makelangrole,
    function (content, message) {
      const parameter = content.trim();
      const {channel, guild, member, author} = message;

      // Already remind case-sentitive here, so okayish to not remind after
      if (!startWithPrefix(parameter)) {
        channel.send(`Must start with (case-sensitive) ${prefixes}`);
        return false;
      }
      // Check if role already exists, case-sensitive
      if (guild.roles.some(r => parameter === r.name)) {
        channel.send(`The role '${parameter}' already exists`);
        // return false;
      }
      const findPrefix = parameter.match(/(.+?) .+/);
      if (findPrefix == null) {
        channel.send('Please also include a language.');
        return false;        
      }

      const targetPrefix = findPrefix[1];
      const sortedRoles = guild.roles
        .filter(role => role.name.startsWith(targetPrefix)
          && dontHaveSuffix(role.name))
        .sort((a, b) => a.calculatedPosition - b.calculatedPosition);
      
      // guild.roles
      //   .sort((a, b) => a.calculatedPosition - b.calculatedPosition)
      //   .map(role => [role.name, role.calculatedPosition, role.id])
      //   .forEach(a => console.log(a));
      const position = sortedRoles.reduce((pos, role) =>
        role.name < parameter // Unsure of how this works exactly
          ? role.calculatedPosition + 1 // This is super buggy
          : pos
        ,sortedRoles.first().calculatedPosition
      ); 
      // console.log(`-${parameter} ${position}`);
      
      (message.guild.createRole({ // Note: newly created occupies a position too
        name: parameter,
        // position, // Some really wierd behaviour with setting this
        permissions: ROLE_PROFILE[targetPrefix].permissions,
        hoist: ROLE_PROFILE[targetPrefix].hoist,
        mentionable: true,
      }, `${member.displayName} ${author.tag} ${author.id} created the role.`)
        .then(role => role.setPermissions(['CONNECT']))
        .then(role => role.setPosition(position))
        .then(function (role) {
          channel.send(`<@&${role.id}> '${parameter}' successfully created.'`);
        }).catch(function () {
          channel.send(`'${parameter}' successfully created.'`);
        })
      );
      return true;
    }
  );

  library.addCommand('listcolorlangs', ['Language Server'],
    '_listroles [\'local\']',
    'Lists all the roles in prefixed by learning/etc and not in the ignore list.',
    '\'local\' specifies the current channel',
    listcolorlangs,
    function (parameter, message) {
      const languages = _getColoringLanguageRoles(message.guild);
      origin.send(`'${languages.join('\', \'')}'`);
      return true;
    }
  );

  library.addCommand('assigncolor', ['Language Server'],
    '',
    'Assigns all the non-main language roles a color tweening',
    `  Hard-coded tween between to 0xCA3A2E to 0xFEBF8E 
    Prefixes are ${ROLE_INCLUDE_PREFIXES.join(', ')}
    Excludes are ${ROLE_IGNORE_SUFFIX.join(', ')}`,
    assigncolor,
    function (parameter, message) {
      const {guild} = message;

      // Setting stuff
      const startColor = [202,58, 46];  // 0xCA3A2E
      const endinColor = [254,191,142]; // 0xFEBF8E

      const suffix = _getColoringLanguageRoles(guild);

      const length = suffix.length;
      const colorIndices = [0, 1, 2];
      const step = _.chain(colorIndices)(
        _.map(i => (startColor[i] - endinColor[i]) /  (length - 1))
      );
      const colorMap = {};
      _.range(0, length, 1).forEach(i =>
        // Map over each color, so three elements and tween with sizes of {step}
        colorMap[suffix[i]] = _.chain(colorIndices)(_.map( 
          c => Math.max(0,Math.min(255,Math.round(endinColor[c] + step[c] * i)))
        ))
      );

      const languages = Object.keys(colorMap);    
      (guild.roles
        .filter(role => ROLE_INCLUDE_PREFIXES
          .some(prefix => languages
            .some(lang => role.name === `${prefix} ${lang}`)
          )
        ).forEach(role => role.setColor(colorMap[_extractLanguage(role.name)]))
      );
      return true;
    }
  );
};