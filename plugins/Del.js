const DEL_REQUIRE = 3;

const Vote = require('./Vote.js');

module.exports = class Del {
  constructor(bot) {
    this.bot = bot;
    this.tg = bot.telegram;
    this.bot.command('delete', (ctx)=>this.req(ctx));
    this.bot.helpQueue(this.help, this.settings);

    this.votes = {};
  }
  help(ctx) {
    return `/delete - reply this to a message to start a vote to delete it`;
  }
  settings(ctx) {
    return `Require ${DEL_REQUIRE} confirmations to delete a message.`;
  }
  async processVotes(res, del) {
    let done = false;
    let msg = '';

    if (res.sum >= DEL_REQUIRE) {
      done = true;
      await this.tg.deleteMessage(del.chat.id, del.message_id).then(()=>{
        msg += `I've deleted the message in question.`;
      }).catch(()=>{
        msg += `I am sorry, but something went wrong...`;
      });
    } else {
      let rem = DEL_REQUIRE-res.sum;
      msg += `I am currently missing another ${rem} confirmation${rem!=1?'s':''}.`;
    }
    return {done, msg};
  }
  async req(ctx) {
    console.log('del request', ctx, ctx.update.message);
    if (!ctx.update.message.reply_to_message) {
      return ctx.reply('Reply to a message i should votedelete');
    }
    let msg = ctx.update.message.reply_to_message;
    let txt = `Should I delete the message?`;

    let vote = new Vote(
      this.bot,
      msg.chat.id,
      txt,
      ['Confirm'],
      (...args)=>this.processVotes(...args),
      msg
    );
  }
}
