const {MTProto,} = require('telegram-mtproto');

/*
 * This module uses the telegram mtproto api to resolve usernames into userIDs.
 * Whenever a user is @mentioned in a message this modules propulated the messages entities propery with the userobject that has been mentioned
 * This is required because the normal bot-api (and so telegraf) has no way to get the userobject when a user is mentined using the username.
 * Example: 'Hello @someuser!' -> ctx.message.entities[0].user
 */
module.exports = class Resolver {
  constructor(token) {
    this.mtproto = MTProto({
      server: {
        webogram: true,
      },
      api: {
        initConnection: 0x69796de9,
        api_id: 49631,
      },
    });
    this.loggedin = this.login(token);
    this.middleware = (...args)=>this.req(...args);
  }
  async login(token) {
    await this.mtproto('auth.importBotAuthorization', {
      flags: 0,
      api_id: 49631,
      api_hash: 'fb050b8f6771e15bfda5df2409931569',
      bot_auth_token: token,
    });
    console.log('Login using mtproto successful.');
  }
  async resolve(username) {
    await this.loggedin;
    return await this.mtproto('contacts.resolveUsername', {username,}).then((peer)=>{
      let user = peer.users[0];
      if (user.username === username) return user;
      return;
    }).catch(()=>undefined); // eslint-disable-line no-undefined
  }
  async req(ctx, next) {
    if (ctx.update && ctx.update.message && ctx.update.message.entities) {
      let msg = ctx.update.message;
      for (const e of msg.entities) {
        if (e.type === 'mention' && !e.user) {
          let username = msg.text.slice(e.offset+1, e.offset+e.length);
          e.user = await this.resolve(username);
        }
      }
    }
    next();
  }
};
