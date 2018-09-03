module.exports = class AI {
  constructor(bot) {
    bot.hears('AI', (ctx)=>ctx.reply(`My logic is undeniable.`));
  }
};
