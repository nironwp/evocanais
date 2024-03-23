/* eslint-disable no-mixed-spaces-and-tabs */
import { CommandContext, InlineKeyboard } from 'grammy';
import * as middleware from './middleware';
import cache from './cache';
import TelegramAddon from './addons/telegram';


async function showAddBotCommand(ctx: any, client: TelegramAddon) {
	try {
		const inlineKeyboard = new InlineKeyboard()
		// .url(
		// 	'🔵 Incluir Grupo',
		// 	`https://t.me/${client.bot.botInfo.username}?startgroup=added_as_admin&admin=post_messages+delete_messages+edit_messages+invite_users+pin_messages`
		// )
		// .row();

		inlineKeyboard
			.url(
				'🟢 Incluir Canal',
				`https://t.me/${client.bot.botInfo.username}?startchannel=added_as_admin&admin=post_messages+delete_messages+edit_messages+invite_users+pin_messages`
			)
			.row();

		try {
			return client.bot.api.sendMessage(
				ctx.chat.id,
				'♻️ Antes de tudo...\n\n• Seu canal/grupo deve ter pelo menos 300 inscritos para entrar na lista.\n\nQuer participar?\n\n👌 É bem fácil! Só adicione o bot como administrador do seu canal e conceda as permissões necessárias:\n\n✔️ Editar mensagens\n✔️ Enviar mensagens\n✔️ Deletar mensagens\n✔️ Convidar usários',
				{
					reply_markup: inlineKeyboard,
				}
			);
		} catch (error) {
			console.log(
				'Erro ao enviar mensagem de start para usuario: ',
				ctx.from.id
			);
		}
	} catch (error) {
		console.log('Erro no comando de mostrar bot')	
	}
}



async function startCommand(ctx: any, client: TelegramAddon) {
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
				} catch (error) {
					console.log(
						'Erro ao enviar mensagem de confirmação no chat ',
						ctx.from.id
					);
				}
			} catch (error) {
				console.log('Error while confirmating state in the');
			}
		}

		const ownedGroups = await cache.prisma_client.group.findMany({
			where: {
				telegram_id_owner_id: ctx.from.id,
			},
		});
		const ownedChannels = await cache.prisma_client.channel.findMany({
			where: {
				telegram_id_owner_id: ctx.from.id,
			},
		});

		const inlineKeyboard = new InlineKeyboard()
			.text('📝 Participar da lista', 'show_list_options').row()
				

		if (ownedGroups.length > 0) {
			inlineKeyboard.text('🗂 Meus grupos', 'my_groups').row();
		}
		if(ownedChannels.length > 0) {
			inlineKeyboard.text('🔊 Meus canais' , 'my_channels');
		}
		inlineKeyboard.add();
		try {
			try {
				return middleware.reply(ctx as any, cache.config.start_command_text, {
					reply_markup: inlineKeyboard,
				});
			} catch (error) {
				console.log(
					'Erro ao enviar mensagem de start para usuario: ',
					ctx.from.id
				);
			}
		} catch (error) {
			console.log('Error in reply:', error);
		}
	} catch (error) {
		console.log('Erro no comando de start:', error);
	}
}

async function getTotalLeads(ctx: any, client: TelegramAddon) {
	try {
		console.log('Tentou acessar uma aréa restrita do bot:', ctx.from.id);
		try {
			if (ctx.from.id + '' !== cache.config.owner_id + '') {
				return ctx.reply('Você não tem permissão para executar esse comando.');
			}
		} catch (error) {
			console.log('Error in reply:', error);
			return;
		}
		const ownedGroups = await cache.prisma_client.group.findMany({
			where: {
				status: 'ACTIVE',
			},
		});

		const ownedChannels = await cache.prisma_client.channel.findMany({
			where: {
				status: 'ACTIVE',
			},
		});
		let membersCount = 0;
		for (const group of ownedGroups) {
			const isAdmin = await client.checkIsAdmin(
				group.telegram_id,
				client.bot.botInfo.id
			);

			try {
				if (isAdmin) {
					membersCount += await client.bot.api.getChatMemberCount(
						group.telegram_id
					);
				}
			} catch (error) {
				console.log(error);
			}
		}

		let channelMembersCount = 0;
		for (const channel of ownedChannels) {
			const isAdmin = await client.checkIsAdmin(
				channel.telegram_id,
				client.bot.botInfo.id
			);

			try {
				if (isAdmin) {
					channelMembersCount += await client.bot.api.getChatMemberCount(
						channel.telegram_id
					);
				}
			} catch (error) {
				console.log(error);
			}
		}

		try {
			return await ctx.reply(
				`O total de pessoas nos grupos do bot é: ${membersCount}\n\nO total de pessoas nos canais do bot é: ${channelMembersCount}\n\nO Total de membros do bot é: ${membersCount + channelMembersCount}`
			);
		} catch (error) {
			console.log(error);
		}
	} catch (e) {
		console.log(e);
	}
}

async function personalGroupsCommand(ctx: any, client: TelegramAddon) {
	try {
		const ownedGroups = await cache.prisma_client.group.findMany({
			where: {
				telegram_id_owner_id: ctx.from.id,
			},
		});

		const inlineKeyboard = new InlineKeyboard();

		for (const group of ownedGroups) {
			const invite = await client.generateGroupInviteLink(
				group.telegram_id,
				client.bot.botInfo.id
			);
			const title = await client.getGroupName(group.telegram_id);

			// Adiciona cada grupo como um botão no InlineKeyboard
			inlineKeyboard.url(title, invite).row();
		}

		try {
			if (ownedGroups.length === 0) {
				try {
					return ctx.reply('Você não possui grupos com nosso bot.');
				} catch (error) {
					console.log('Erro ao enviar mensagem de inexistencia de grupos');
				}
			}

			// Enviar a mensagem com os botões dos grupos
			return ctx.reply('🗂 Seus grupos com nosso bot:', {
				reply_markup: inlineKeyboard,
			});
		} catch (error) {
			console.log('Error in reply:', error);
		}
	} catch (error) {
		console.log('Error while ');
	}
}

async function personalChannelsCommand(ctx: any, client: TelegramAddon) {
	try {
		const ownedChannels = await cache.prisma_client.channel.findMany({
			where: {
				telegram_id_owner_id: ctx.from.id,
			},
		});

		const inlineKeyboard = new InlineKeyboard();

		for (const channel of ownedChannels) {
			try {
				
				const invite = await client.generateGroupInviteLink(
					channel.telegram_id,
					client.bot.botInfo.id
				).catch((err) => {
					console.log('Error while generating invite')
				});

				if(invite) {
					const title = await client.getGroupName(channel.telegram_id);
					inlineKeyboard.url(title, invite).row();

				}
			} catch (error) {
				console.log('Error while generating invite link to bot')				
			}

			// Adiciona cada grupo como um botão no InlineKeyboard
		}

		try {
			if (ownedChannels.length === 0) {
				try {
					return ctx.reply('Você não possui canais com nosso bot.');
				} catch (error) {
					console.log('Erro ao enviar mensagem de inexistencia de canais');
				}
			}

			// Enviar a mensagem com os botões dos grupos
			return ctx.reply('🗂 Seus canais com nosso bot:', {
				reply_markup: inlineKeyboard,
			});
		} catch (error) {
			console.log('Error in reply');
		}
	} catch (error) {
		console.log('Error while ');
	}
}

async function acceptReportCommand(ctx: any, client: TelegramAddon) {
	try {
		console.log('TENTOU ACESSAR UMA ÁREA RESTRITA:', ctx.from.id);
		try {
			if (ctx.from.id + '' !== cache.config.owner_id + '') {
				return ctx.reply('Você não tem permissão para executar esse comando.');
			}
		} catch (error) {
			console.log('Error in reply:', error);
			return;
		}
		console.log('ACESSOU UMA ÁREA RESTRITA:', ctx.from.id);
		const groups = await cache.prisma_client.group.findMany();
		const inlineKeyboard = new InlineKeyboard();

		for (const group of groups) {
			if (group.status === 'OFF') {
				try {
					const invite = await client.generateGroupInviteLink(
						group.telegram_id,
						client.bot.botInfo.id
					);
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
				} catch (error) {
					console.log('Erro ao criar lista de aceitação e rejeição dos grupos');
				}
			}
		}

		try {
			return ctx.reply('Grupos com estado pendente:', {
				reply_markup: inlineKeyboard,
			});
		} catch (error) {
			console.log('Error in reply:', error);
		}
	} catch (error) {
		console.log('Error while exectuing accept report command');
	}
}

async function channelAcceptReportCommand(ctx: any, client: TelegramAddon) {
	try {
		console.log('TENTOU ACESSAR UMA ÁREA RESTRITA:', ctx.from.id);
		try {
			if (ctx.from.id + '' !== cache.config.owner_id + '') {
				return ctx.reply('Você não tem permissão para executar esse comando.');
			}
		} catch (error) {
			console.log('Error in reply:', error);
			return;
		}
		console.log('ACESSOU UMA ÁREA RESTRITA:', ctx.from.id);
		const channels = await cache.prisma_client.channel.findMany({
			where: {
				status: 'OFF'
			}
		});
		const inlineKeyboard = new InlineKeyboard();

		for (const channel of channels) {
			if (channel.status === 'OFF') {
				try {
					const invite = await client.generateGroupInviteLink(
						channel.telegram_id,
						client.bot.botInfo.id
					);
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
				} catch (error) {
					console.log('Erro ao criar lista de aceitação e rejeição dos grupos');
				}
			}
		}

		try {
			return ctx.reply('Canais com estado pendente:', {
				reply_markup: inlineKeyboard,
			});
		} catch (error) {
			console.log('Error in reply:', error);
		}
	} catch (error) {
		console.log('Error while exectuing accept report command');
	}
}


async function listGroupsCommand(ctx: any, client: TelegramAddon, page: number = 1, pageSize: number = 5) {
    try {
        try {
            if (ctx.from.id + '' !== cache.config.owner_id + '') {
                return ctx.reply('Você não tem permissão para executar esse comando.');
            }
        } catch (error) {
            console.log('Error in reply:', error);
        }

        const groups = await cache.prisma_client.group.findMany({
            where: {
                status: 'ACTIVE'
            }
        });

        const startIndex = (page - 1) * pageSize;
        const endIndex = page * pageSize;
        const groupsToShow = groups.slice(startIndex, endIndex);

        const inlineKeyboard = new InlineKeyboard();

        for (const group of groupsToShow) {
            const invite = await client.generateGroupInviteLink(
                group.telegram_id,
                client.bot.botInfo.id
            );
            if (invite) {
                const title = await client.getGroupName(group.telegram_id);

                inlineKeyboard.url(title, invite).row();
                if (group.status === 'ACTIVE') {
                    if (!group.fixed) {
                        inlineKeyboard
                            .text('Fixar 🌟', `fix_group:${group.telegram_id}`)
                            .text('Remover 🚫', `reject_group:${group.telegram_id}`)
                            .row();
                    } else {
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
        } catch (error) {
            console.log('Erro ao tentar fixar bot');
        }
    } catch (error) {
        console.log('Error while listing groups command');
    }
}


async function listChannelsComand(ctx: any, client: TelegramAddon, page: number = 1, pageSize: number = 5) {
    try {
        try {
            if (ctx.from.id + '' !== cache.config.owner_id + '') {
                return ctx.reply('Você não tem permissão para executar esse comando.');
            }
        } catch (error) {
            console.log('Error in reply:', error);
        }

        const channels = await cache.prisma_client.channel.findMany({
            where: {
                status: 'ACTIVE',
            },
        });

        const startIndex = (page - 1) * pageSize;
        const endIndex = page * pageSize;
        const channelsToShow = channels.slice(startIndex, endIndex);

        const inlineKeyboard = new InlineKeyboard();

        for (const channel of channelsToShow) {
            const invite = await client.generateGroupInviteLink(
                channel.telegram_id,
                client.bot.botInfo.id
            );
            if (invite) {
                const title = await client.getGroupName(channel.telegram_id);

                inlineKeyboard.url(title, invite).row();
                if (channel.status === 'ACTIVE') {
                    if (!channel.fixed) {
                        inlineKeyboard
                            .text('Fixar 🌟', `fix_channel:${channel.telegram_id}`)
                            .text('Remover 🚫', `reject_channel:${channel.telegram_id}`)
                            .row();
                    } else {
                        inlineKeyboard
                            .text('Desfixar 🌟', `unfix_channel:${channel.telegram_id}`)
                            .text('Remover 🚫', `reject_channel:${channel.telegram_id}`)
                            .row();
                    }
                }
            }
        }

        try {
            return ctx.reply('Canais:\n'+'Pagina - '+page+':\n'+'Tamanho da Página - '+pageSize+':', {
                reply_markup: inlineKeyboard,
            });
        } catch (error) {
            console.log('Erro ao tentar fixar bot');
        }
    } catch (error) {
        console.log('Error while listing groups command');
    }
}

export {
	startCommand,
	personalGroupsCommand,
	acceptReportCommand,
	channelAcceptReportCommand,
	listGroupsCommand,
	personalChannelsCommand,
	listChannelsComand,
	getTotalLeads,
	showAddBotCommand
};
