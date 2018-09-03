const uuid = require('uuid/v4');
const Extra = require('telegraf').Extra;

/*
 * This module add a callbackButton markup that calls a callback function on button press.
 * When a function is passed as the data to the button, a unique id is generated and the function is executed whenever this id is received.
 * Example: TGExtra.Markup.callbackButton('MyButton', (ctx)=>console.log('MyButton was pressed in chat ' + ctx.chat.id))
 */
module.exports = (bot) => {
  Extra.Markup.callbackButton = (text, data, hide)=>{
    if (typeof data === 'function') {
      let id = uuid();
      bot.action(id, data);
      data = id;
    }
    return {text, callback_data: data, hide,};
  };
};
