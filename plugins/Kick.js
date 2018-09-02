const KICK_REQUIRE = 0.5;
const KICK_TIMEOUT = 5;
const KICK_VOTE_DURATION = 10*60;

const Vote = require('./Vote.js');
const TGExtra = require('telegraf').Extra;

class KickVote extends Vote {
  constructor(bot, chat, user) {
    super(
      bot,
      chat.id,
      `Should I kick [${user.first_name}](tg://user?id=${user.id})?`,
      ['Yes', 'No'],
      (...a)=>this.processVotes(...a),
    );
    this.chat = chat;
    this.user = user;
    this.expiredAt = (new Date()).getTime() + KICK_VOTE_DURATION * 60 * 1000;
    this.anonymized = true;
  }

  async processVotes(res) {
    let done = false;
    let msg = `This vote expires in ~${Math.round((this.expiredAt-(new Date()))/1000/60)} minutes.`;
    msg += `\n${Math.round(res.results['Yes']*100/res.sum)}% voted in favour of this (${KICK_REQUIRE*100}% required).`;

    if (this.expiredAt < new Date()) {
      this.done = true;
      msg = 'This vote has expired.\n';
      if (res.results['Yes']/res.sum > KICK_REQUIRE) {
        let extras = {until_date: Math.round(new Date()/1000 + KICK_TIMEOUT*60)};
        await this.tg.kickChatMember(this.chat.id, this.user.id, extras).then(()=>{
          msg += `I've kicked the user in question.`;
        }).catch(()=>{
          msg += `I am sorry, but something went wrong...`;
        });
      } else {
        msg += `I didn't kick the user.`;
      }
    }
    return {done, msg};
  }
}

module.exports = class Kick {
  constructor(bot) {
    this.bot = bot;
    this.tg = bot.telegram;
    this.bot.command('kick', (ctx)=>this.req(ctx, true));
    this.bot.helpQueue(this.help, this.settings);

    this.votes = {};
  }
  help(ctx) {
    let help = [
      `/kick @username - start a vote to kick @username.`,
    ];
    return help.join('\n');
  }
  settings(ctx) {
    let set = [
      `Require more than ${KICK_REQUIRE*100}% of all votes within ${KICK_VOTE_DURATION} minutes to kick a user.`,
      `Kicked users are currently banned forever (API Limitation for now...).`,
    ];
    return set.join('\n');
  }

  async req(ctx) {
    let msg = ctx.update.message;
    console.log('kick request', msg);
    if (!(msg.entities[1] && msg.entities[1].user)) {
      return ctx.reply('You need to mention the user to votekick.');
    }
    let user = msg.entities[1].user;
    let txt = `Should I kick [${user.first_name}](tg://user?id=${user.id})?`;

    let vote = new KickVote(this.bot, msg.chat.id, user);
  }
};
