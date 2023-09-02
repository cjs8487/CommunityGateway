import { open, writeFileSync } from 'fs';
import { RequestHandler, Router } from 'express';
import { fileManager, userManager } from '../../System';
import { isAuthenticated } from '../../core/auth/AuthCore';
import { userHasGrant } from '../../lib/UserLib';

const files = Router();

const hasFileEditPermissions: RequestHandler = (req, res, next) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const user = userManager.getUser(req.session.user);
    if (!userHasGrant(user, 'Manage Content Pages')) {
        res.sendStatus(401);
        return;
    }
    next();
};

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

files.use(isAuthenticated, hasFileEditPermissions);

files.post('/:path', (req, res) => {
    const { path } = req.params;
    const { name, content } = req.body;
    if (!name) {
        res.status(400).send('File name not provided');
    }
    if (fileManager.fileWithNameExistsInPath(name, path)) {
        res.status(400).send('File with that name already exists');
        return;
    }
    const id = fileManager.createFile(name, path);
    if (!content) {
        open(`files/${path}/${name}`, 'w', () => {});
    } else {
        writeFileSync(`files/${path}/${name}`, content);
    }

    res.status(201).send({ id });
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
