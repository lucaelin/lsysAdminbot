const TGExtra = require('telegraf').Extra;

/*
 * This module provides a unified way to display help messages and settings when a users issues the help command.
 * Moules can register help- and setting- callbacks that return the text to display to the user
 * These callbacks can return different results depending on the context where the help message was issued
 * usage: bot.helpQueue(helptextCallback, settingsCallback)
 * example: bot.helpQueue(
 *   ()=>'Enter /getCount to see the current count',
 *   (ctx)=>'The config says that the count is limited to '+someconfig[ctx.chat.id].maxCount
 * );
 */
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
};
