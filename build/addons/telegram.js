"use strict";
/* eslint-disable no-mixed-spaces-and-tabs */
// /**
//  * Telegram Ticketing System - Telegram Implementation with GrammY
//  */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
const transformer_throttler_1 = require("@grammyjs/transformer-throttler");
const cache_1 = __importDefault(require("../cache"));
/**
 * Telegram Ticketing System - Telegram Implementation with GrammY
 */
class TelegramAddon {
    /**
   * Constructor
   * @param {String} token Telegram Bot Token
   */
    constructor(token) {
        this.bot = new grammy_1.Bot(token);
        const throttler = (0, transformer_throttler_1.apiThrottler)();
        this.bot.api.config.use(throttler);
    }
    async checkIsAdmin(chatId, memberId) {
        try {
            const member = await this.bot.api.getChatMember(chatId, memberId);
            if (member.status === 'administrator') {
                return true;
            }
            else {
                return false;
            }
        }
        catch (error) {
            console.log(`Erro ao checar se membro ${memberId} é admin do chat ${chatId}`);
        }
        // Verificar se o bot é um administrador
    }
    async generateGroupInviteLink(chatId, memberId) {
        try {
            // Supondo que 'bot' é sua instância do bot
            if (!(await this.checkIsAdmin(chatId, memberId)))
                return null;
            const link = await this.bot.api.createChatInviteLink(chatId);
            return link.invite_link;
        }
        catch (error) {
            console.error('Erro ao criar link de convite:', error);
            return null;
        }
    }
    async getGroupName(chatId) {
        try {
            // Supondo que 'bot' é sua instância do bot
            const chat = await this.bot.api.getChat(chatId);
            if (chat.type === 'channel' ||
                chat.type === 'group' ||
                chat.type === 'supergroup') {
                return chat.title;
            } // 'title' contém o nome do grupo
            if (chat.type === 'private') {
                return chat.username;
            }
            return null;
        }
        catch (error) {
            console.error('Erro ao obter informações do grupo:', error);
            return null; // Ou lidar com o erro conforme necessário
        }
    }
    async enviarMensagemDeDivulgacaoCanais(client) {
        const allChannels = await cache_1.default.prisma_client.channel.findMany({
            where: {
                status: 'ACTIVE',
            },
        });
        console.log('Total de canais encontrados ATIVOS:', allChannels.length);
        // Separar grupos fixados dos outros
        const fixedChannels = allChannels.filter((channel) => channel.fixed === true);
        const otherChannels = allChannels.filter((channel) => channel.fixed !== true);
        // Misturar os grupos não fixados aleatoriamente
        const shuffledOtherChannels = otherChannels.sort(() => 0.5 - Math.random());
        // Combinar os grupos fixados com uma parte dos grupos misturados para ter no máximo 20 grupos
        const combinedChannels = [...fixedChannels, ...shuffledOtherChannels].slice(0, 16);
        const inlineKeyboard = new grammy_1.InlineKeyboard();
        for (const element of combinedChannels) {
            try {
                const member = await this.bot.api.getChatMember(element.telegram_id, client.bot.botInfo.id);
                // Verificar se o bot é um administrador
                if (member.status === 'administrator') {
                    const invite = await client.bot.api.createChatInviteLink(element.telegram_id);
                    const chat = await client.bot.api.getChat(element.telegram_id);
                    let title;
                    if (chat.type === 'channel' ||
                        chat.type === 'group' ||
                        chat.type === 'supergroup') {
                        title = chat.title;
                    } // 'title' contém o nome do grupo
                    if (chat.type === 'private') {
                        title = chat.username;
                    }
                    inlineKeyboard.url(title, invite.invite_link).row();
                }
            }
            catch (error) {
                console.log('Erro ao preparar canal para ser enviado a lista:', error.message);
            }
        }
        console.log('Alrady make keyboard');
        inlineKeyboard
            .url('💫 Adicionar', `https://t.me/${client.bot.botInfo.username}`)
            .url('📂 Ver todos', 'putariaporno.com')
            .row();
        for (const channel of allChannels) {
            console.log('Enviando mensagem para o canal:', channel.telegram_id);
            try {
                const otherMessages = await cache_1.default.prisma_client.listMessage.findMany({
                    where: {
                        chat_id: channel.telegram_id
                    }
                });
                for (const oldMessage of otherMessages) {
                    try {
                        await client.bot.api.deleteMessage(channel.telegram_id, oldMessage.message_id);
                    }
                    catch (error) {
                        console.log('Error while deleting message:', oldMessage.message_id);
                        await cache_1.default.prisma_client.listMessage.deleteMany({
                            where: {
                                chat_id: channel.telegram_id,
                                message_id: oldMessage.message_id
                            }
                        });
                    }
                }
                const message = await client.bot.api.sendMessage(channel.telegram_id, `A lista mais quente do telegram 🔥 @${client.bot.botInfo.username}\n\nVeja mais Canais e Grupos em: https://putariaporno.com`, {
                    reply_markup: inlineKeyboard,
                });
                try {
                    await client.bot.api.pinChatMessage(channel.telegram_id, message.message_id);
                }
                catch (error) {
                    console.log('Error while pining message:', channel.telegram_id);
                }
                await cache_1.default.prisma_client.listMessage.create({
                    data: {
                        chat_id: channel.telegram_id,
                        message_id: message.message_id
                    }
                });
                await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(true);
                    }, 3000);
                });
            }
            catch (error) {
                console.log('Erro ao enviar mensagem para o canal:', channel.telegram_id);
                console.log('Erro recebido:', error.message);
            }
        }
    }
    async enviarMensagemDeDivulgacao(client) {
        const allGroups = await cache_1.default.prisma_client.group.findMany({
            where: {
                status: 'ACTIVE',
            },
        });
        console.log('Total de grupos encontrados ATIVOS:', allGroups.length);
        // Separar grupos fixados dos outros
        const fixedGroups = allGroups.filter((group) => group.fixed === true);
        const otherGroups = allGroups.filter((group) => group.fixed !== true);
        // Misturar os grupos não fixados aleatoriamente
        const shuffledOtherGroups = otherGroups.sort(() => 0.5 - Math.random());
        // Combinar os grupos fixados com uma parte dos grupos misturados para ter no máximo 20 grupos
        const combinedGroups = [...fixedGroups, ...shuffledOtherGroups].slice(0, 16);
        const inlineKeyboard = new grammy_1.InlineKeyboard();
        for (const element of combinedGroups) {
            try {
                const member = await this.bot.api.getChatMember(element.telegram_id, client.bot.botInfo.id);
                // Verificar se o bot é um administrador
                if (member.status === 'administrator') {
                    const invite = await client.bot.api.createChatInviteLink(element.telegram_id);
                    const chat = await client.bot.api.getChat(element.telegram_id);
                    let title;
                    if (chat.type === 'channel' ||
                        chat.type === 'group' ||
                        chat.type === 'supergroup') {
                        title = chat.title;
                    } // 'title' contém o nome do grupo
                    if (chat.type === 'private') {
                        title = chat.username;
                    }
                    inlineKeyboard.url(title, invite.invite_link).row();
                }
            }
            catch (error) {
                console.log('Erro ao preparar grupo para ser enviado a lista:', error.message);
            }
        }
        console.log('Alrady make keyboard');
        inlineKeyboard
            .url('🫵🏻 Adicionar', `https://t.me/${client.bot.botInfo.username}`)
            .url('📂 Ver todos', 'putariaporno.com')
            .row();
        for (const group of allGroups) {
            console.log('Enviando mensagem para o grupo:', group.telegram_id);
            try {
                await client.bot.api.sendMessage(group.telegram_id, `A lista mais quente do telegram 🔥 @${client.bot.botInfo.username}\n\nVeja mais Canais e Grupos em: https://putariaporno.com`, {
                    reply_markup: inlineKeyboard,
                });
                await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(true);
                    }, 3000);
                });
            }
            catch (error) {
                console.log('Erro ao enviar mensagem para o grupo:', group.telegram_id);
            }
        }
    }
}
exports.default = TelegramAddon;
//# sourceMappingURL=telegram.js.map