const Telegraf = require("telegraf");
const callbackButton = require("./callbackButton.js");
const Resolver = require("./Resolver.js");
const Help = require("./Help.js");

const plugins = require('./plugins');
const config = require('./config.json');

const bot = new Telegraf(config.botToken);
global.bot = bot;
bot.use((new Resolver(config.resolveToken)).middleware);
callbackButton(bot);
new Help(bot);

bot.telegram.getMe().then((botInfo) => {
  bot.options.username = botInfo.username
});
global.plugins = plugins.loadAll(bot);

bot.startPolling()
