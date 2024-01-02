import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
const ffprobeAsync = promisify(ffmpeg.ffprobe);

interface FFProbeResult {
  format: {
    duration: number;
  };
}

async function trimMediaTo20Seconds(inputFilePath: string): Promise<string> {
	// Gera um nome de arquivo de saída baseado no arquivo de entrada
	const outputFilePath = path.join(
		path.dirname(inputFilePath),
		path.basename(inputFilePath, path.extname(inputFilePath)) +
      '_trimmed' +
      path.extname(inputFilePath)
	);

	// Verifica se o arquivo trimmed já existe.
	if (fs.existsSync(outputFilePath)) {
		console.log('O arquivo trimmed já existe.');
		return outputFilePath;
	}

	// Verifica se o arquivo de entrada existe.
	if (!fs.existsSync(inputFilePath)) {
		throw new Error('O arquivo de entrada não existe.');
	}

	// Obtém as informações do arquivo de mídia de forma assíncrona.
	const metadata = (await ffprobeAsync(inputFilePath)) as FFProbeResult;
	const duration = metadata.format.duration;

	// Se o arquivo tiver 20 segundos ou menos, apenas retorna o arquivo original.
	if (duration <= 20) {
		console.log('O arquivo tem 20 segundos ou menos.');
		return inputFilePath;
	}

	// Configura e executa o ffmpeg para cortar o arquivo de mídia.
	return new Promise<string>((resolve, reject) => {
		ffmpeg(inputFilePath)
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

export default trimMediaTo20Seconds;
