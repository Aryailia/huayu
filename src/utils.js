// const VOICE_CHATTER = x => x.id === '405541849462472705';
const {Collection} = require('discord.js');
const VOICE_CHATTER = '405541849462472705';
const Helper = require('disbot-utils');
const {_} = require('denotational');

const utils = {
  _,
  Helper,

  PERMISSION_SELF: [
    { type: Helper.PERM_TYPE_USER, value: '164612665929498624', level: 1 }
  ],

  getVoiceRoleGuildMembers: function (guild) {
    const role = guild.roles.get(VOICE_CHATTER);
    return role == null ? new Collection() : role.members;
  },

  applyRemoveVoiceRole: function (guildMember) {
    // Rember, the role commands are async
    return (guildMember.voiceChannelID == null)
      ? guildMember.removeRole(VOICE_CHATTER)
      : guildMember.addRole(VOICE_CHATTER);
  },

  refreshVoiceRoleState: function (guild) {
    // Catch any who have role but are not in channel
    const byRole = utils.getVoiceRoleGuildMembers(guild)
      .map(utils.applyRemoveVoiceRole);
    
    const byChannel = _.flatten(1)(guild.channels
      .filter(c => c.type === 'voice')
      .map(channel => channel.members.map(utils.applyRemoveVoiceRole))
    );

    console.log(byRole.concat(byChannel));
  },

  removeVoiceRole: function (member) {
    return member.removeRole(VOICE_CHATTER);
  },
};

module.exports = utils;