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
/* eslint-disable @typescript-eslint/no-explicit-any */
const telegram_1 = __importStar(require("./telegram"));
const cache_1 = __importDefault(require("./cache"));
const node_cron_1 = __importDefault(require("node-cron"));
// import { StringSession } from "telegram/sessions/index.js";
// import { Api, TelegramClient } from "telegram";
// import { Button } from "telegram/tl/custom/button.js";
const web = __importStar(require("./addons/web"));
process.env.TZ = 'America/Sao_Paulo';
async function startBot() {
    const bot = await (0, telegram_1.default)(cache_1.default.config.bot_token);
    cache_1.default.setBot(bot);
    (0, telegram_1.dolisteners)(bot);
    console.log(await bot.bot.api.getMe());
    console.log('Ouvintes estão escutando');
    cache_1.default.config.horarios.forEach((horario) => {
        const [hora, minuto] = horario.split(':');
        const cronTime = `${minuto} ${hora} * * *`;
        console.log('Mensagem estabelecida para o horario cron:', cronTime);
        console.log(`${hora}:${minuto}`);
        try {
            node_cron_1.default.schedule(cronTime, async () => {
                try {
                    await bot.enviarMensagemDeDivulgacao(bot);
                    await bot.enviarMensagemDeDivulgacaoCanais(bot);
                }
                catch (error) {
                    console.log('Error schedule');
                }
            });
        }
        catch (error) {
            console.log('Erro ao estabelecer cron:', error);
        }
    });
    console.log('Mensagens engatilhadas');
    bot.bot.catch((err) => { console.log(err); });
    bot.bot.start();
    web.init();
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
startBot();
//# sourceMappingURL=index.js.map