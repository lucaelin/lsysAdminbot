const uuid = require('uuid/v4');
const Extra = require('telegraf').Extra;

module.exports = (bot) => {
  Extra.Markup.callbackButton = (text, data, hide)=>{
    if(typeof data === 'function') {
      let id = uuid();
      bot.action(id, data);
      data = id;
    }
    return { text, callback_data: data, hide };
  };
};