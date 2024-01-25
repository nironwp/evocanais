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
exports.showAddBotCommand = exports.getTotalLeads = exports.listChannelsComand = exports.personalChannelsCommand = exports.listGroupsCommand = exports.channelAcceptReportCommand = exports.acceptReportCommand = exports.personalGroupsCommand = exports.startCommand = void 0;
/* eslint-disable no-mixed-spaces-and-tabs */
const grammy_1 = require("grammy");
const middleware = __importStar(require("./middleware"));
const cache_1 = __importDefault(require("./cache"));
async function showAddBotCommand(ctx, client) {
    try {
        const inlineKeyboard = new grammy_1.InlineKeyboard();
        // .url(
        // 	'🔵 Incluir Grupo',
        // 	`https://t.me/${client.bot.botInfo.username}?startgroup=added_as_admin&admin=post_messages+delete_messages+edit_messages+invite_users+pin_messages`
        // )
        // .row();
        inlineKeyboard
            .url('🟢 Incluir Canal', `https://t.me/${client.bot.botInfo.username}?startchannel=added_as_admin&admin=post_messages+delete_messages+edit_messages+invite_users+pin_messages`)
            .row();
        try {
            return client.bot.api.sendMessage(ctx.chat.id, '♻️ Antes de tudo...\n\n• Seu canal/grupo deve ter pelo menos 300 inscritos para entrar na lista.\n\nQuer participar?\n\n👌 É bem fácil! Só adicione o bot como administrador do seu canal e conceda as permissões necessárias:\n\n✔️ Editar mensagens\n✔️ Enviar mensagens\n✔️ Deletar mensagens\n✔️ Convidar usários', {
                reply_markup: inlineKeyboard,
            });
        }
        catch (error) {
            console.log('Erro ao enviar mensagem de start para usuario: ', ctx.from.id);
        }
    }
    catch (error) {
        console.log('Erro no comando de mostrar bot');
    }
}
exports.showAddBotCommand = showAddBotCommand;
async function startCommand(ctx, client) {
    try {
        const params = ctx.message.text.split(' ');
        console.log(params[1]);
        console.log('Bot adicionado ao telegram é um admin? ');
        console.log(await client.checkIsAdmin(ctx.chat.id, client.bot.botInfo.id));
        if (params.length > 1 && params[1] === 'added_as_admin') {
            // O bot foi adicionado a um grupo com o deep link específico
            try {
                try {
                    return ctx.reply('✅ Bot Adicionado');
                }
                catch (error) {
                    console.log('Erro ao enviar mensagem de confirmação no chat ', ctx.from.id);
                }
            }
            catch (error) {
                console.log('Error while confirmating state in the');
            }
        }
        const ownedGroups = await cache_1.default.prisma_client.group.findMany({
            where: {
                telegram_id_owner_id: ctx.from.id,
            },
        });
        const ownedChannels = await cache_1.default.prisma_client.channel.findMany({
            where: {
                telegram_id_owner_id: ctx.from.id,
            },
        });
        const inlineKeyboard = new grammy_1.InlineKeyboard()
            .text('📝 Participar da lista', 'show_list_options').row();
        if (ownedGroups.length > 0) {
            inlineKeyboard.text('🗂 Meus grupos', 'my_groups').row();
        }
        if (ownedChannels.length > 0) {
            inlineKeyboard.text('🔊 Meus canais', 'my_channels');
        }
        inlineKeyboard.add();
        try {
            try {
                return middleware.reply(ctx, cache_1.default.config.start_command_text, {
                    reply_markup: inlineKeyboard,
                });
            }
            catch (error) {
                console.log('Erro ao enviar mensagem de start para usuario: ', ctx.from.id);
            }
        }
        catch (error) {
            console.log('Error in reply:', error);
        }
    }
    catch (error) {
        console.log('Erro no comando de start:', error);
    }
}
exports.startCommand = startCommand;
async function getTotalLeads(ctx, client) {
    try {
        console.log('Tentou acessar uma aréa restrita do bot:', ctx.from.id);
        try {
            if (ctx.from.id + '' !== cache_1.default.config.owner_id + '') {
                return ctx.reply('Você não tem permissão para executar esse comando.');
            }
        }
        catch (error) {
            console.log('Error in reply:', error);
            return;
        }
        const ownedGroups = await cache_1.default.prisma_client.group.findMany({
            where: {
                status: 'ACTIVE',
            },
        });
        const ownedChannels = await cache_1.default.prisma_client.channel.findMany({
            where: {
                status: 'ACTIVE',
            },
        });
        let membersCount = 0;
        for (const group of ownedGroups) {
            const isAdmin = await client.checkIsAdmin(group.telegram_id, client.bot.botInfo.id);
            try {
                if (isAdmin) {
                    membersCount += await client.bot.api.getChatMemberCount(group.telegram_id);
                }
            }
            catch (error) {
                console.log(error);
            }
        }
        let channelMembersCount = 0;
        for (const channel of ownedChannels) {
            const isAdmin = await client.checkIsAdmin(channel.telegram_id, client.bot.botInfo.id);
            try {
                if (isAdmin) {
                    channelMembersCount += await client.bot.api.getChatMemberCount(channel.telegram_id);
                }
            }
            catch (error) {
                console.log(error);
            }
        }
        try {
            return await ctx.reply(`O total de pessoas nos grupos do bot é: ${membersCount}\n\nO total de pessoas nos canais do bot é: ${channelMembersCount}\n\nO Total de membros do bot é: ${membersCount + channelMembersCount}`);
        }
        catch (error) {
            console.log(error);
        }
    }
    catch (e) {
        console.log(e);
    }
}
exports.getTotalLeads = getTotalLeads;
async function personalGroupsCommand(ctx, client) {
    try {
        const ownedGroups = await cache_1.default.prisma_client.group.findMany({
            where: {
                telegram_id_owner_id: ctx.from.id,
            },
        });
        const inlineKeyboard = new grammy_1.InlineKeyboard();
        for (const group of ownedGroups) {
            const invite = await client.generateGroupInviteLink(group.telegram_id, client.bot.botInfo.id);
            const title = await client.getGroupName(group.telegram_id);
            // Adiciona cada grupo como um botão no InlineKeyboard
            inlineKeyboard.url(title, invite).row();
        }
        try {
            if (ownedGroups.length === 0) {
                try {
                    return ctx.reply('Você não possui grupos com nosso bot.');
                }
                catch (error) {
                    console.log('Erro ao enviar mensagem de inexistencia de grupos');
                }
            }
            // Enviar a mensagem com os botões dos grupos
            return ctx.reply('🗂 Seus grupos com nosso bot:', {
                reply_markup: inlineKeyboard,
            });
        }
        catch (error) {
            console.log('Error in reply:', error);
        }
    }
    catch (error) {
        console.log('Error while ');
    }
}
exports.personalGroupsCommand = personalGroupsCommand;
async function personalChannelsCommand(ctx, client) {
    try {
        const ownedChannels = await cache_1.default.prisma_client.channel.findMany({
            where: {
                telegram_id_owner_id: ctx.from.id,
            },
        });
        const inlineKeyboard = new grammy_1.InlineKeyboard();
        for (const channel of ownedChannels) {
            const invite = await client.generateGroupInviteLink(channel.telegram_id, client.bot.botInfo.id);
            const title = await client.getGroupName(channel.telegram_id);
            // Adiciona cada grupo como um botão no InlineKeyboard
            inlineKeyboard.url(title, invite).row();
        }
        try {
            if (ownedChannels.length === 0) {
                try {
                    return ctx.reply('Você não possui canais com nosso bot.');
                }
                catch (error) {
                    console.log('Erro ao enviar mensagem de inexistencia de canais');
                }
            }
            // Enviar a mensagem com os botões dos grupos
            return ctx.reply('🗂 Seus canais com nosso bot:', {
                reply_markup: inlineKeyboard,
            });
        }
        catch (error) {
            console.log('Error in reply');
        }
    }
    catch (error) {
        console.log('Error while ');
    }
}
exports.personalChannelsCommand = personalChannelsCommand;
async function acceptReportCommand(ctx, client) {
    try {
        console.log('TENTOU ACESSAR UMA ÁREA RESTRITA:', ctx.from.id);
        try {
            if (ctx.from.id + '' !== cache_1.default.config.owner_id + '') {
                return ctx.reply('Você não tem permissão para executar esse comando.');
            }
        }
        catch (error) {
            console.log('Error in reply:', error);
            return;
        }
        console.log('ACESSOU UMA ÁREA RESTRITA:', ctx.from.id);
        const groups = await cache_1.default.prisma_client.group.findMany();
        const inlineKeyboard = new grammy_1.InlineKeyboard();
        for (const group of groups) {
            if (group.status === 'OFF') {
                try {
                    const invite = await client.generateGroupInviteLink(group.telegram_id, client.bot.botInfo.id);
                    if (invite) {
                        const title = await client.getGroupName(group.telegram_id);
                        console.log(`Title: ${title}\nInvite: ${invite}`);
                        if (title || invite) {
                            inlineKeyboard.url(title, invite).row();
                            inlineKeyboard
                                .text('Aceitar ✔️', `accept_group:${group.telegram_id}`)
                                .text('Rejeitar ❌', `reject_group:${group.telegram_id}`)
                                .row();
                        }
                    }
                }
                catch (error) {
                    console.log('Erro ao criar lista de aceitação e rejeição dos grupos');
                }
            }
        }
        try {
            return ctx.reply('Grupos com estado pendente:', {
                reply_markup: inlineKeyboard,
            });
        }
        catch (error) {
            console.log('Error in reply:', error);
        }
    }
    catch (error) {
        console.log('Error while exectuing accept report command');
    }
}
exports.acceptReportCommand = acceptReportCommand;
async function channelAcceptReportCommand(ctx, client) {
    try {
        console.log('TENTOU ACESSAR UMA ÁREA RESTRITA:', ctx.from.id);
        try {
            if (ctx.from.id + '' !== cache_1.default.config.owner_id + '') {
                return ctx.reply('Você não tem permissão para executar esse comando.');
            }
        }
        catch (error) {
            console.log('Error in reply:', error);
            return;
        }
        console.log('ACESSOU UMA ÁREA RESTRITA:', ctx.from.id);
        const channels = await cache_1.default.prisma_client.channel.findMany({
            where: {
                status: 'OFF'
            }
        });
        const inlineKeyboard = new grammy_1.InlineKeyboard();
        for (const channel of channels) {
            if (channel.status === 'OFF') {
                try {
                    const invite = await client.generateGroupInviteLink(channel.telegram_id, client.bot.botInfo.id);
                    if (invite) {
                        const title = await client.getGroupName(channel.telegram_id);
                        console.log(`Title: ${title}\nInvite: ${invite}`);
                        if (title || invite) {
                            inlineKeyboard.url(title, invite).row();
                            inlineKeyboard
                                .text('Aceitar ✔️', `accept_channel:${channel.telegram_id}`)
                                .text('Rejeitar ❌', `reject_channel:${channel.telegram_id}`)
                                .row();
                        }
                    }
                }
                catch (error) {
                    console.log('Erro ao criar lista de aceitação e rejeição dos grupos');
                }
            }
        }
        try {
            return ctx.reply('Canais com estado pendente:', {
                reply_markup: inlineKeyboard,
            });
        }
        catch (error) {
            console.log('Error in reply:', error);
        }
    }
    catch (error) {
        console.log('Error while exectuing accept report command');
    }
}
exports.channelAcceptReportCommand = channelAcceptReportCommand;
async function listGroupsCommand(ctx, client) {
    try {
        try {
            if (ctx.from.id + '' !== cache_1.default.config.owner_id + '') {
                return ctx.reply('Você não tem permissão para executar esse comando.');
            }
        }
        catch (error) {
            console.log('Error in reply:', error);
        }
        const groups = await cache_1.default.prisma_client.group.findMany({
            where: {
                status: 'ACTIVE'
            }
        });
        const inlineKeyboard = new grammy_1.InlineKeyboard();
        for (const group of groups) {
            const invite = await client.generateGroupInviteLink(group.telegram_id, client.bot.botInfo.id);
            if (invite) {
                const title = await client.getGroupName(group.telegram_id);
                inlineKeyboard.url(title, invite).row();
                if (group.status === 'ACTIVE') {
                    if (!group.fixed) {
                        inlineKeyboard
                            .text('Fixar 🌟', `fix_group:${group.telegram_id}`)
                            .text('Remover 🚫', `reject_group:${group.telegram_id}`)
                            .row();
                    }
                    else {
                        inlineKeyboard
                            .text('Desfixar 🌟', `unfix_group:${group.telegram_id}`)
                            .text('Remover 🚫', `reject_group:${group.telegram_id}`)
                            .row();
                    }
                }
            }
        }
        try {
            return ctx.reply('Grupos:', {
                reply_markup: inlineKeyboard,
            });
        }
        catch (error) {
            console.log('Erro ao tentar fixar bot');
        }
    }
    catch (error) {
        console.log('Error while listing groups command');
    }
}
exports.listGroupsCommand = listGroupsCommand;
async function listChannelsComand(ctx, client) {
    try {
        try {
            if (ctx.from.id + '' !== cache_1.default.config.owner_id + '') {
                return ctx.reply('Você não tem permissão para executar esse comando.');
            }
        }
        catch (error) {
            console.log('Error in reply:', error);
        }
        const channels = await cache_1.default.prisma_client.channel.findMany({
            where: {
                status: 'ACTIVE',
            },
        });
        const inlineKeyboard = new grammy_1.InlineKeyboard();
        for (const channel of channels) {
            const invite = await client.generateGroupInviteLink(channel.telegram_id, client.bot.botInfo.id);
            if (invite) {
                const title = await client.getGroupName(channel.telegram_id);
                inlineKeyboard.url(title, invite).row();
                if (channel.status === 'ACTIVE') {
                    if (!channel.fixed) {
                        inlineKeyboard
                            .text('Fixar 🌟', `fix_channel:${channel.telegram_id}`)
                            .text('Remover 🚫', `reject_channel:${channel.telegram_id}`)
                            .row();
                    }
                    else {
                        inlineKeyboard
                            .text('Desfixar 🌟', `unfix_channel:${channel.telegram_id}`)
                            .text('Remover 🚫', `reject_channel:${channel.telegram_id}`)
                            .row();
                    }
                }
            }
        }
        try {
            return ctx.reply('Canais:', {
                reply_markup: inlineKeyboard,
            });
        }
        catch (error) {
            console.log('Erro ao tentar fixar bot');
        }
    }
    catch (error) {
        console.log('Error while listing groups command');
    }
}
exports.listChannelsComand = listChannelsComand;
//# sourceMappingURL=commands.js.map