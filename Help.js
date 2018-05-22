const TGExtra = require('telegraf').Extra;

module.exports = class Help {
  constructor(bot) {
    bot.helpQueue = (...args) => this.helpQueue(...args);
    bot.help((ctx)=>this.req(ctx));
    this.helpCbs = [];
    this.settingCbs = [];
  }
  helpQueue(cb1, cb2) {
    this.helpCbs.push(cb1);
    this.settingCbs.push(cb2);
  }
  async req(ctx) {
    let msg = 'Beep Bop Beep! I am Admi the Admin!\n\n';
    msg += (await Promise.all(this.helpCbs.map(async (cb)=>await cb(ctx)))).join('\n');
    msg += '\n\nI am currently told to:\n';
    msg += (await Promise.all(this.settingCbs.map(async (cb)=>await cb(ctx)))).join('\n');
    ctx.reply(msg, TGExtra.markdown());
  }
}