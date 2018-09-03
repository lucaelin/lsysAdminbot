const TGExtra = require('telegraf').Extra;

module.exports = class Vote {
  constructor(bot, chatId, question, values, cb, ...args) {
    this.bot = bot;
    this.tg = bot.telegram;
    this.question = question;
    this.values = values;
    this.chatId = chatId;
    this.cb = cb;
    this.cbargs = args;
    this.votes = {};
    this.anonymized = false;
    this.done = false;
    this.prepared = this.prepare();
  }
  async prepare() {
    let buttons = this.values.map((t)=>{
      return TGExtra.Markup.callbackButton(t, async (ctx)=>{
        if (await this.addVote(t, ctx.update.callback_query.from.id)) {
          return ctx.answerCbQuery(`Your vote for '${t}' has been added!`);
        }
        return ctx.answerCbQuery(`This vote has expired!`);
      });
    });
    let kbd = TGExtra
      .markdown()
      .markup((m) => m.inlineKeyboard(buttons).oneTime().resize());

    this.votemsg = await this.tg.sendMessage(this.chatId, `I am putting this to a vote! ${this.question}`, kbd);
    this.resultmsg = await this.tg.sendMessage(this.chatId, 'There have been no votes, yet.');
    await this.dutyCycle();
  }
  async dutyCycle() {
    if (this.done) return;
    await this.evaluate();
    if (!this.done) setTimeout(()=>this.dutyCycle(), 60*1000);
  }

  async addVote(value, id) {
    if (this.done) return false;
    this.votes[id] = value;
    return await this.evaluate();
  }
  async evaluate() {
    let sum = 0;
    let res = {};

    for (const v of Object.values(this.votes)) {
      sum++;
      if (typeof res[v] === 'undefined') res[v] = 0;
      res[v]++;
    }

    let {done, msg,} = await this.cb({sum, results: res, votes: this.votes,}, ...this.cbargs);
    this.done = done;

    let resTxt = '';
    if (this.anonymized) {
      resTxt = Object.keys(res).map((k)=>`${res[k]} vote${res[k]!==1?'s':''} ${res[k]!==1?'say':'says'} '${k}'`).join('\n');
    } else {
      resTxt = Object.keys(this.votes).map((k)=>`[${k}](tg://user?id=${k}) said '${this.votes[k]}'`).join('\n');
    }
    let txt = `There ${sum!==1?'have':'has'} been ${sum} vote${sum!==1?'s':''} so far${sum!==0?':':'.'}\n`;
    txt += resTxt;
    txt += msg?'\n'+msg:'';
    let extras = TGExtra.markdown();

    await this.tg.editMessageText(
      this.chatId,
      this.resultmsg.message_id,
      null,
      txt,
      extras
    ).catch((e) => console.error(e));
    return {sum, results: res, votes: this.votes,};
  }
};
