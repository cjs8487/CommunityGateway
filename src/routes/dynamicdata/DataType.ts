import { Router } from 'express';
import { isAuthenticated } from '../../core/auth/AuthCore';
import { dynamicDataManager, userManager } from '../../System';
import { userHasGrant } from '../../lib/UserLib';

const types = Router();

types.get('/', (req, res) => {
    const typeList = dynamicDataManager.getAllTypes();
    res.status(200).send(typeList);
});

types.use(isAuthenticated, (req, res, next) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const user = userManager.getUser(req.session.user);
    if (!userHasGrant(user, 'Manage Dynamic Data')) {
        res.sendStatus(403);
        return;
    }
    next();
});

types.post('/', (req, res) => {
    const { name, shape } = req.body;
    dynamicDataManager.createType(name, JSON.stringify(shape));
    res.status(200).send();
});

types.delete('/:typeName', (req, res) => {
    const { typeName } = req.params;
    const deletes = dynamicDataManager.deleteType(typeName);
    if (deletes === 0) {
        res.status(404).send();
        return;
    }
    res.status(200).send();
});

export default types;
