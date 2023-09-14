import { Router } from 'express';
import { isAdmin, isAuthenticated } from '../../core/auth/AuthCore';
import { dynamicDataManager, userManager } from '../../System';
import types from './DataType';
import { syncDataToMessages } from '../../bots/discord/modules/DataSync';
import { userHasGrant } from '../../lib/UserLib';

const dynamicData = Router();

dynamicData.use('/types', types);

dynamicData.get('/:type', (req, res) => {
    const { type } = req.params;
    const { withShape } = req.query;
    const data = dynamicDataManager.getAllData(type);
    const typeObj = dynamicDataManager.getType(type);
    if (!typeObj) {
        res.status(404).send();
        return;
    }
    if (withShape) {
        res.status(200).send({
            data: data.map((item) => ({
                id: item.id,
                data: JSON.parse(item.data),
            })),
            shape: JSON.parse(typeObj.shape),
        });
    } else {
        res.status(200).send(
            data.map((item) => ({
                id: item.id,
                data: JSON.parse(item.data),
            })),
        );
    }
});

dynamicData.use(isAuthenticated, (req, res, next) => {
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

dynamicData.post('/:typeName', isAuthenticated, isAdmin, (req, res) => {
    const { typeName } = req.params;
    const { data } = req.body;
    const type = dynamicDataManager.getType(typeName);
    if (!type) {
        res.status(400).send('Unknown data type');
        return;
    }
    dynamicDataManager.insertData(type, JSON.stringify(data));
    syncDataToMessages(typeName);
    res.status(200).send();
});

dynamicData.post('/:typeName/syncOrder', (req, res) => {
    const { typeName } = req.params;
    const { order } = req.body;
    dynamicDataManager.updateOrder(typeName, order);
    syncDataToMessages(typeName);
    res.status(200).send();
});

dynamicData.post('/edit/:id', (req, res) => {
    const { id } = req.params;
    const parsedId = Number(id);
    const { data } = req.body;
    if (Number.isNaN(parsedId)) {
        res.status(400).send('Invalid id');
        return;
    }
    const changes = dynamicDataManager.updateData(
        parsedId,
        JSON.stringify(data),
    );
    if (changes === 0) {
        res.sendStatus(404);
        return;
    }
    syncDataToMessages(dynamicDataManager.getTypeForData(parsedId));
    res.status(200).send();
});

dynamicData.delete('/:id', (req, res) => {
    const { id } = req.params;
    const parsedId = Number(id);
    if (Number.isNaN(parsedId)) {
        res.status(400).send('Invalid id');
        return;
    }
    const deletes = dynamicDataManager.deleteData(parsedId);
    if (deletes === 0) {
        res.status(404).send();
        return;
    }
    syncDataToMessages(dynamicDataManager.getTypeForData(parsedId));
    res.status(200).send();
});

export default dynamicData;
