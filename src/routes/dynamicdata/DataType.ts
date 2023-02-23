import { Router } from 'express';
import { dynamicDataManager } from '../../System';

const types = Router();

types.get('/types', (req, res) => {
    const typeList = dynamicDataManager.getAllTypes();
    res.status(200).send(typeList);
});

types.post('/types', (req, res) => {
    const { name } = req.body;
    dynamicDataManager.createType(name);
    res.status(200).send();
});

types.delete('/types/:typeName', (req, res) => {
    const { typeName } = req.params;
    const deletes = dynamicDataManager.deleteType(typeName);
    if (deletes === 0) {
        res.status(404).send();
        return;
    }
    res.status(200).send();
});

export default types;
