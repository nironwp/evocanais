import fs from 'fs';
import path from 'path';

function getRandomFile(folderPath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		fs.readdir(folderPath, (err, files) => {
			if (err) {
				return reject(err);
			}

			const allFiles = files.filter((file) =>
				fs.statSync(path.join(folderPath, file)).isFile()
			);

			if (allFiles.length === 0) {
				return reject(new Error('No files found in the directory.'));
			}

			const randomFile = allFiles[Math.floor(Math.random() * allFiles.length)];
			resolve(path.join(folderPath, randomFile));
		});
	});
}


export {getRandomFile}