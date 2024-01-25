"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function getRandomFile(folderPath) {
    return new Promise((resolve, reject) => {
        fs_1.default.readdir(folderPath, (err, files) => {
            if (err) {
                return reject(err);
            }
            const allFiles = files.filter((file) => fs_1.default.statSync(path_1.default.join(folderPath, file)).isFile());
            if (allFiles.length === 0) {
                return reject(new Error('No files found in the directory.'));
            }
            const randomFile = allFiles[Math.floor(Math.random() * allFiles.length)];
            resolve(path_1.default.join(folderPath, randomFile));
        });
    });
}
exports.getRandomFile = getRandomFile;
//# sourceMappingURL=utils.js.map