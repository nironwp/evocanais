import { Context } from 'grammy';
import cache from './cache'


const strictEscape = function (str: string | any[]) {
	if (cache.config.parse_mode == 'MarkdownV2') {
		let newStr = '';
		const chars = ['[', ']', '(', ')', '_', '*', '~', '`'];
		for (let i = 0; i < str.length; i++) {
			// escape special characters
			if (chars.includes(str[i])) {
				newStr += '\\' + str[i];
			} else {
				newStr += str[i];
			}
		}
		return newStr;
	} else {
		return str.toString();
	}
};


const msg = async function (
	id: string | number,
	msg: string | string[],
	extra: any = {
		parse_mode: cache.config.parse_mode,

	}
) {
	msg = escapeText(msg);
	// Check web message
	if (id.toString().indexOf('WEB') > -1 && id != cache.config.staff_chat_id) {
		// Web message
		console.log('First else');
		console.log('Web message');
	} else if (
		id.toString().indexOf('SIGNAL') > -1 &&
    id != cache.config.staff_chat_id
	) {
		console.log('Second else');
		// Signal message
		console.log('Signal message');
	} else {
		msg = msg.replace(/ {2}/g, '');
		console.log('GO here');
		console.log('Last else');
		try {
			
			return await cache.bot.bot.api.sendMessage(id, msg, extra);
		} catch (error) {
			console.log('Error sending message in the middleware')
		}
	}
};

const reply = function (
	ctx: Context,
	msgtext: string | string[],
	extra: any = {
		parse_mode: cache.config.parse_mode,
	}
) {
	try {
		msg(ctx.message.chat.id, msgtext, extra);
			
	} catch (error) {
		console.log('Error in reply:', error);
	}
};

const escapeText = function (str: string | string[]) {
	return str.toString();
};

export { strictEscape, msg, escapeText,reply};