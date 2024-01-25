"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dolisteners = void 0;
const telegram_1 = __importDefault(require("./addons/telegram"));
const commands = __importStar(require("./commands"));
const cache_1 = __importDefault(require("./cache"));
const grammy_1 = require("grammy");
async function dolisteners(client) {
    client.bot.command('start', (ctx) => {
        try {
            commands.startCommand(ctx, client);
        }
        catch (error) {
            console.log('Error on start command');
        }
    });
    client.bot.command('reportgroups', (ctx) => {
        try {
            commands.acceptReportCommand(ctx, client);
        }
        catch (error) {
            console.log('Error on reportgroups');
        }
    });
    client.bot.command('reportchannels', (ctx) => {
        try {
            commands.channelAcceptReportCommand(ctx, client);
        }
        catch (error) {
            console.log('Error on reportchannels');
        }
    });
    client.bot.command('getleads', (ctx) => {
        try {
            commands.getTotalLeads(ctx, client);
        }
        catch (error) {
            console.log('Error on getLeads');
        }
    });
    client.bot.command('listgroups', (ctx) => {
        try {
            commands.listGroupsCommand(ctx, client);
        }
        catch (error) {
            console.log('Error on listgroups');
        }
    });
    client.bot.command('listchannels', (ctx) => {
        try {
            commands.listChannelsComand(ctx, client);
        }
        catch (error) {
            console.log('Error on listchannels');
        }
    });
    client.bot.hears(/(.+)/, (ctx) => {
        console.log('HEARS EVERTHING /(.+)/');
        // text.handleText(bot, ctx, keys);
    });
    client.bot.on('my_chat_member', async (ctx) => {
        try {
            const chatMember = ctx.update.my_chat_member;
            if (chatMember.chat.type !== 'channel')
                return;
            console.log(ctx.update.my_chat_member);
            // Check if the bot was added to the chat
            const isBig = (await ctx.api.getChatMemberCount(chatMember.chat.id)) >= 300;
            console.log(await ctx.api.getChatMemberCount(chatMember.chat.id));
            if (chatMember.new_chat_member.status === 'administrator' &&
                chatMember.new_chat_member.can_post_messages &&
                chatMember.new_chat_member.can_delete_messages &&
                chatMember.new_chat_member.can_invite_users && isBig) {
                ctx.api.sendMessage(chatMember.from.id, '✅ Bot adicionado com sucesso! Agora, por favor, aguarde a aprovação de um administrador para seu canal começar a ser divulgado. Agradecemos a sua paciência!');
                await cache_1.default.prisma_client.channel.create({
                    data: {
                        telegram_id: chatMember.chat.id,
                        telegram_id_owner_id: chatMember.from.id,
                    },
                });
            }
            else {
                await ctx.api.leaveChat(chatMember.chat.id);
                const inlineKeyboard = new grammy_1.InlineKeyboard()
                    .url('🟢 Incluir Canal', `https://t.me/${client.bot.botInfo.username}?startchannel=added_as_admin&admin=post_messages+delete_messages+edit_messages+invite_users+pin_messages`)
                    .row();
                ctx.api.sendMessage(chatMember.from.id, `${isBig
                    ? ''
                    : 'Antes de qualquer coisa... seu canal deve ter no mínimo 300 inscritos para entrar na lista\n\n'}🚫 O bot não é um administrador do canal ${chatMember.chat.title} ou não tem as permissões corretas.\n\nPermissões necessárias:\n\n✅ Editar mensagens\n✅ Enviar mensagens\n✅ Deletar mensagens\n✅ Convidar usários`, {
                    reply_markup: inlineKeyboard,
                });
            }
        }
        catch (error) {
            console.log('Erro ao considerar entrada em grupo');
        }
    });
    client.bot.on(':new_chat_members', async (ctx) => {
        // Verifica se o bot está entre os novos membros adicionados
        console.log(ctx);
        try {
            if (ctx.message.new_chat_members.some((member) => member.id === client.bot.botInfo.id)) {
                console.log(ctx.chat);
                const groupId = ctx.chat.id;
                const groupName = ctx.chat.title;
                console.log(groupId, groupName);
                const admins = await client.bot.api.getChatAdministrators(groupId);
                const owner = findGroupOwner(admins);
                console.log(owner);
                if (owner) {
                    await cache_1.default.prisma_client.group.create({
                        data: {
                            telegram_id_owner_id: owner.id,
                            telegram_id: groupId,
                        },
                    });
                }
            }
        }
        catch (error) {
            console.log('Error while registrating');
        }
    });
    client.bot.on(':left_chat_member', async (ctx) => {
        try {
            if (ctx.message.left_chat_member.id === client.bot.botInfo.id) {
                const groupId = ctx.chat.id;
                await cache_1.default.prisma_client.group.delete({
                    where: {
                        telegram_id: groupId,
                    },
                });
            }
        }
        catch (error) {
            console.log('Error while checking left');
        }
    });
    client.bot.on('callback_query:data', async (ctx) => {
        try {
            console.log('Callback recebido: ', ctx.callbackQuery.data);
            if (ctx.callbackQuery.data === 'my_groups') {
                try {
                    return await commands.personalGroupsCommand(ctx, client);
                }
                catch (error) {
                    console.log('Comando para ver grupos retornou erro');
                    return ctx.reply('Erro ao buscar seus grupos');
                }
            }
            if (ctx.callbackQuery.data === 'show_list_options') {
                console.log('EXECUTANDO COMANDO DE EXIBIR ADDS');
                try {
                    return commands.showAddBotCommand(ctx, client);
                }
                catch (error) {
                    console.log('Comando para adicionar bot retornou erro');
                    return ctx.reply('Erro ao buscar seus grupos');
                }
            }
            if (ctx.callbackQuery.data === 'my_channels') {
                try {
                    return await commands.personalChannelsCommand(ctx, client);
                }
                catch (error) {
                    console.log('Comando para adicionar bot retornou erro');
                    return ctx.reply('Erro ao buscar seus grupos');
                }
            }
            const [command, groupId] = ctx.callbackQuery.data.split(':');
            if (command === 'accept_group') {
                await cache_1.default.prisma_client.group.update({
                    where: {
                        telegram_id: Number(groupId),
                    },
                    data: {
                        status: 'ACTIVE',
                    },
                });
                ctx.reply('Grupo Aceito!');
            }
            if (command === 'reject_group') {
                await cache_1.default.prisma_client.group.delete({
                    where: {
                        telegram_id: Number(groupId),
                    },
                });
                ctx.reply('Grupo Recusado!');
            }
            if (command === 'accept_channel') {
                await cache_1.default.prisma_client.channel.update({
                    where: {
                        telegram_id: Number(groupId),
                    },
                    data: {
                        status: 'ACTIVE',
                    },
                });
                ctx.reply('Canal Aceito!');
            }
            if (command === 'reject_channel') {
                await cache_1.default.prisma_client.channel.delete({
                    where: {
                        telegram_id: Number(groupId),
                    },
                });
                ctx.reply('Canal Recusado!');
            }
            if (command === 'fix_group') {
                await cache_1.default.prisma_client.group.update({
                    where: {
                        telegram_id: Number(groupId),
                    },
                    data: {
                        fixed: true,
                    },
                });
                ctx.reply('Grupo Fixado!');
            }
            if (command === 'unfix_group') {
                await cache_1.default.prisma_client.group.update({
                    where: {
                        telegram_id: Number(groupId),
                    },
                    data: {
                        fixed: false,
                    },
                });
                ctx.reply('Grupo Desfixado!');
            }
            if (command === 'fix_channel') {
                await cache_1.default.prisma_client.channel.update({
                    where: {
                        telegram_id: Number(groupId),
                    },
                    data: {
                        fixed: true,
                    },
                });
                ctx.reply('Canal Fixado!');
            }
            if (command === 'unfix_channel') {
                await cache_1.default.prisma_client.channel.update({
                    where: {
                        telegram_id: Number(groupId),
                    },
                    data: {
                        fixed: false,
                    },
                });
                ctx.reply('Canal Desfixado!');
            }
        }
        catch (error) {
            console.log('Error while checking:', error);
        }
    });
}
exports.dolisteners = dolisteners;
function findGroupOwner(admins) {
    try {
        const creator = admins.find((admin) => admin.status === 'creator');
        if (creator) {
            return creator.user;
        }
        else {
            return null; // Criador não encontrado ou não acessível
        }
    }
    catch (error) {
        console.error('Erro ao obter administradores do grupo:', error);
        return null;
    }
}
async function getBot(bot_token) {
    return new telegram_1.default(bot_token);
}
exports.default = getBot;
//# sourceMappingURL=telegram.js.map