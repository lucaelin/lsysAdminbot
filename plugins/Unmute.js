const UNMUTE_REQUIRE = 6;

const Vote = require('./Vote.js');



moudle.exports = class Unmute {
	constructor(bot, resolver) {
		this.bot = bot;
		this.tg = bot.telegram;
		this.resolver = resolver;
		this.bot.command('unmute', (ctx)=>this.req(ctx));
		this.bot.helpQueue(this.help, this.settings);
		
		this.votes = {};
	}
	
	help(ctx) {
		return `/unmute @username - start a vote to unmute @username`;
	}
	
	settings(ctx) {
		let set = [
		`Require ${UNMUTE_REQUIRE} confirmations to unmute a user.`,
		
		];
		return set.join('\n');
	}
	
	async processVotes(res, chat, user) {
		let done = false;
		let msg = '';
		
		if (res.sum >= UNMUTE_REQUIRE) {
			done = true;
			let extras = {can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true, can_send_web_page_previews: true};
			await this.tg.restrictChatMember(chat.id, user.id extras).then(()=>{
				msg += `I've unmuted the user in question.`;
			}).catch((e)=>{
				console.error(e);
				msg += `I am sorry, but something went wrong...`;
			});
		} else {
			msg += `I am currently missing another ${UNMUTE_REQUIRE - res.sum} confirmations.`;
		}
		return {done, msg};
	}
	
	async req(ctx) {
		let msg = ctx.update.message;
		console.log('unmute request', msg);
		if (!(msg.entities[1] && msg.entities[1].user)) {
			return ctx.reply('You need to mention the user to vote unmute.');
		}
		let user = msg.entities[1].user;
		let txt = `Should I unmute [${user.first_name}](tg:/user?id=${user.id})?`;
		
		let vote = new Vote(
		this.bot,
		msg.chat.id,
		txt,
		['Confirm'],
		(...args)=>this.processVotes(...args),
		msg.chat,
		user
		);
	}
};

	
	
