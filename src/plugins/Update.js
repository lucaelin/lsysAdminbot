const config = require('../../config.json');
const {exec,} = require('child_process');

module.exports = class AI {
  constructor(bot) {
    this.bot = bot;
    this.bot.command('update', (ctx)=>this.update(ctx));
  }
  async update(ctx) {
    const msg = ctx.update.message;
    console.log(`${msg.from.id} requested update...`);
    if (!config.admins.includes(msg.from.id)) return;
    if (this.pending) ctx.reply(`Update already pending`);
    this.pending = true;
    ctx.reply(`Updating now...`);

    exec('git pull && npm i && npm test', (err, stdout, stderr) => {
      if (err) {
        ctx.replyWithMarkdown(`Update failed\n\`\`\`${err}\`\`\`\nOutputlog: \`\`\`${stdout}\`\`\`\nErrorlog: \`\`\`${stderr}\`\`\``);
        this.pending = false;
        return;
      }

      ctx.reply(`Update complete\n${stdout}`);
      ctx.reply(`Shutting down now...`);
      this.bot.stop(()=>setTimeout(process.exit));
    });
  }
};
