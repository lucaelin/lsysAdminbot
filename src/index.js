const Telegraf = require('telegraf');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const callbackButton = require('./callbackButton.js');
const Resolver = require('./Resolver.js');
const Help = require('./Help.js');

const plugins = require('./plugins');
const config = require('../config.json');

const bot = new Telegraf(config.botToken);
const db = low(new FileSync('../db.json'));
db.defaults({settings: {},}).write();
global.bot = bot;
bot.use((new Resolver(config.resolveToken)).middleware);
callbackButton(bot);
new Help(bot);

bot.telegram.getMe().then((botInfo) => {
  bot.options.username = botInfo.username;
});
global.plugins = plugins.loadAll(bot, db);

bot.startPolling();
