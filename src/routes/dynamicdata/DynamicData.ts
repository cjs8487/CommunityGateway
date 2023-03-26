import { Router } from 'express';
import { isAdmin, isAuthenticated } from '../../core/auth/AuthCore';
import { dynamicDataManager } from '../../System';
import types from './DataType';

const dynamicData = Router();

dynamicData.use(types);

dynamicData.get('/:type', (req, res) => {
    const { type } = req.params;
    const data = dynamicDataManager.getAllData(type);
    res.status(200).send(data);
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
    res.status(200).send();
});

dynamicData.post('/edit/:id', isAuthenticated, isAdmin, (req, res) => {
    const { id } = req.params;
    const parsedId = Number(id);
    const { data } = req.body;
    if (Number.isNaN(parsedId)) {
        res.status(400).send('Invalid id');
        return;
    }
    const changes = dynamicDataManager.updateData(parsedId, JSON.stringify(data));
    if (changes === 0) {
        res.sendStatus(404);
        return;
    }
    res.status(200).send();
});

dynamicData.delete('/:id', isAuthenticated, isAdmin, (req, res) => {
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
    res.status(200).send();
});

export default dynamicData;
