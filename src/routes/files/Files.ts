import { open, writeFileSync } from 'fs';
import { Router } from 'express';
import { fileManager } from '../../System';

const files = Router();

files.get('/', (req, res) => {
    const fileList = fileManager.getAllFiles();
    res.status(200).send(fileList);
});

files.get('/:path', (req, res) => {
    const { path } = req.params;
    const fileList = fileManager.filesAtPath(path);
    res.status(200).send(fileList);
});

files.get('/:path/count', (req, res) => {
    const { path } = req.params;
    const fileList = fileManager.filesAtPath(path);
    res.status(200).send(fileList.length);
});

files.post('/:path', (req, res) => {
    const { path } = req.params;
    const { name } = req.body;
    if (!name) {
        res.status(400).send('File name not provided');
    }
    fileManager.createFile(name, path);
    open(`files/${path}/${name}`, 'w', () => {});
    res.status(201).send();
});

files.post('/:fileId/edit', (req, res) => {
    const { fileId } = req.params;
    const { content } = req.body;
    if (!content) {
        res.status(400).send('Cannot write an empty file');
        return;
    }
    const fileIdNum = Number(fileId);
    if (Number.isNaN(fileIdNum)) {
        res.status(400).send();
        return;
    }
    const file = fileManager.getFile(fileIdNum);
    if (!file) {
        res.status(404);
        return;
    }
    writeFileSync(`files/${file.path}/${file.name}`, content);
    res.status(200).send();
});

files.delete('/:fileId', (req, res) => {
    const { fileId } = req.params;
    const fileIdNum = Number(fileId);
    if (Number.isNaN(fileIdNum)) {
        res.status(400).send();
        return;
    }
    fileManager.deleteFile(fileIdNum);
});

export default files;
