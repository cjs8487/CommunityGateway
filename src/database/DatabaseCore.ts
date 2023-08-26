import { readdirSync } from 'fs';
import { fileManager } from '../System';

export const loadFilesFromDisk = () => {
    const root = readdirSync('files');
    root.forEach((path) => {
        const files = readdirSync(`files/${path}`);
        files.forEach((file) => {
            if (!fileManager.fileWithNameExistsInPath(file, path)) {
                fileManager.createFile(file, path);
            }
        });
    });
};

export default {};
