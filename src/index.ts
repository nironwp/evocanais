/* eslint-disable @typescript-eslint/no-explicit-any */
import getBot, { dolisteners } from './telegram';
import cache  from './cache';
import cron from 'node-cron';
// import { StringSession } from "telegram/sessions/index.js";
// import { Api, TelegramClient } from "telegram";
// import { Button } from "telegram/tl/custom/button.js";
import * as web from './addons/web'
process.env.TZ = 'America/Sao_Paulo';

async function startBot() {
	const bot = await getBot(cache.config.bot_token)
	cache.setBot(bot)

	dolisteners(bot);

	console.log(await bot.bot.api.getMe());
	console.log('Ouvintes estão escutando')

	cache.config.horarios.forEach((horario) => {
		const [hora, minuto] = horario.split(':');
		const cronTime = `${minuto} ${hora} * * *`;
		console.log('Mensagem estabelecida para o horario cron:', cronTime)
		console.log(`${hora}:${minuto}`)
		try {
			
			cron.schedule(cronTime, async () => {
				try {
					
					await bot.enviarMensagemDeDivulgacao(bot)
					await bot.enviarMensagemDeDivulgacaoCanais(bot)
				} catch (error) {
					console.log('Error schedule')
				}
			});
		} catch (error) {
			console.log('Erro ao estabelecer cron:', error)
		}
	});
	console.log('Mensagens engatilhadas')

	bot.bot.catch((err) => {console.log(err)})
	bot.bot.start()
	web.init()
}
process.on('uncaughtException', (error) => {
	console.error('Uncaught Exception:', error);
	// Aqui você pode registrar o erro ou realizar outras ações de tratamento
});

process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection:', reason);
	// Aqui você pode registrar o motivo da rejeição ou realizar outras ações de tratamento
});

process.on('SIGTERM', (reason, promise) => {
	console.error('Sigterm:', reason);
	// Aqui você pode registrar o motivo da rejeição ou realizar outras ações de tratamento
});


startBot()