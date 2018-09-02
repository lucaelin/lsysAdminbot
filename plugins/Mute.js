const MUTE_REQUIRE = 6;
const MUTE_TIMEOUT = 12*60;

const Vote = require('./Vote.js');

module.exports = class Mute {
  constructor(bot, resolver) {
    this.bot = bot;
    this.tg = bot.telegram;
    this.resolver = resolver;
    this.bot.command('mute', (ctx)=>this.req(ctx));
    this.bot.helpQueue(this.help, this.settings);

    this.votes = {};
  }

  help(ctx) {
    return `/mute @username - start a vote to mute @username`;
  }
  settings(ctx) {
    let set = [
      `Require ${MUTE_REQUIRE} confirmations to mute a user.`,
      `Muting a user lasts for ${MUTE_TIMEOUT} minutes.`,
    ];
    return set.join('\n');
  }
  async processVotes(res, chat, user) {
    let done = false;
    let msg = '';

    if (res.sum >= MUTE_REQUIRE) {
      done = true;
      let extras = {until_date: Math.round(new Date()/1000 + MUTE_TIMEOUT*60), can_send_messages: false};
      await this.tg.restrictChatMember(chat.id, user.id, extras).then(()=>{
        msg += `I've muted the user in question.`;
      }).catch((e)=>{
        console.error(e);
        msg += `I am sorry, but something went wrong...`;
      });
    } else {
      msg += `I am currently missing another ${MUTE_REQUIRE - res.sum} confirmations.`;
    }
    return {done, msg};
  }

  async req(ctx) {
    let msg = ctx.update.message;
    console.log('mute request', msg);
    if (!(msg.entities[1] && msg.entities[1].user)) {
      return ctx.reply('You need to mention the user to votemute.');
    }
    let user = msg.entities[1].user;
    let txt = `Should I mute [${user.first_name}](tg://user?id=${user.id})?`;

    let vote = new Vote(
      this.bot,
      msg.chat.id,
      txt,
      ['Confirm'],
      (...args)=>this.processVotes(...args),
      msg.chat,
      user
    );
  }
};
