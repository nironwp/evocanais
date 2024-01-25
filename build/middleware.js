"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reply = exports.escapeText = exports.msg = exports.strictEscape = void 0;
const cache_1 = __importDefault(require("./cache"));
const strictEscape = function (str) {
    if (cache_1.default.config.parse_mode == 'MarkdownV2') {
        let newStr = '';
        const chars = ['[', ']', '(', ')', '_', '*', '~', '`'];
        for (let i = 0; i < str.length; i++) {
            // escape special characters
            if (chars.includes(str[i])) {
                newStr += '\\' + str[i];
            }
            else {
                newStr += str[i];
            }
        }
        return newStr;
    }
    else {
        return str.toString();
    }
};
exports.strictEscape = strictEscape;
const msg = async function (id, msg, extra = {
    parse_mode: cache_1.default.config.parse_mode,
}) {
    msg = escapeText(msg);
    // Check web message
    if (id.toString().indexOf('WEB') > -1 && id != cache_1.default.config.staff_chat_id) {
        // Web message
        console.log('First else');
        console.log('Web message');
    }
    else if (id.toString().indexOf('SIGNAL') > -1 &&
        id != cache_1.default.config.staff_chat_id) {
        console.log('Second else');
        // Signal message
        console.log('Signal message');
    }
    else {
        msg = msg.replace(/ {2}/g, '');
        console.log('GO here');
        console.log('Last else');
        try {
            return await cache_1.default.bot.bot.api.sendMessage(id, msg, extra);
        }
        catch (error) {
            console.log('Error sending message in the middleware');
        }
    }
};
exports.msg = msg;
const reply = function (ctx, msgtext, extra = {
    parse_mode: cache_1.default.config.parse_mode,
}) {
    try {
        msg(ctx.message.chat.id, msgtext, extra);
    }
    catch (error) {
        console.log('Error in reply:', error);
    }
};
exports.reply = reply;
const escapeText = function (str) {
    return str.toString();
};
exports.escapeText = escapeText;
//# sourceMappingURL=middleware.js.map