"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const ffprobeAsync = (0, util_1.promisify)(fluent_ffmpeg_1.default.ffprobe);
async function trimMediaTo20Seconds(inputFilePath) {
    // Gera um nome de arquivo de saída baseado no arquivo de entrada
    const outputFilePath = path_1.default.join(path_1.default.dirname(inputFilePath), path_1.default.basename(inputFilePath, path_1.default.extname(inputFilePath)) +
        '_trimmed' +
        path_1.default.extname(inputFilePath));
    // Verifica se o arquivo trimmed já existe.
    if (fs_1.default.existsSync(outputFilePath)) {
        console.log('O arquivo trimmed já existe.');
        return outputFilePath;
    }
    // Verifica se o arquivo de entrada existe.
    if (!fs_1.default.existsSync(inputFilePath)) {
        throw new Error('O arquivo de entrada não existe.');
    }
    // Obtém as informações do arquivo de mídia de forma assíncrona.
    const metadata = (await ffprobeAsync(inputFilePath));
    const duration = metadata.format.duration;
    // Se o arquivo tiver 20 segundos ou menos, apenas retorna o arquivo original.
    if (duration <= 20) {
        console.log('O arquivo tem 20 segundos ou menos.');
        return inputFilePath;
    }
    // Configura e executa o ffmpeg para cortar o arquivo de mídia.
    return new Promise((resolve, reject) => {
        (0, fluent_ffmpeg_1.default)(inputFilePath)
            .setStartTime('00:00:00')
            .setDuration(20)
            .output(outputFilePath)
            .on('end', () => {
            console.log('O arquivo foi cortado para 20 segundos.');
            resolve(outputFilePath);
        })
            .on('error', (err) => {
            console.error('Erro ao cortar o arquivo:', err);
            reject(err);
        })
            .run();
    });
}
exports.default = trimMediaTo20Seconds;
//# sourceMappingURL=trimMediaTo20Seconds.js.map