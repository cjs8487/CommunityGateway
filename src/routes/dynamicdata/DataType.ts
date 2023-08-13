import { Router } from 'express';
import { isAdmin, isAuthenticated } from '../../core/auth/AuthCore';
import { dynamicDataManager } from '../../System';

const types = Router();

types.get('/types', (req, res) => {
    const typeList = dynamicDataManager.getAllTypes();
    res.status(200).send(typeList);
});

types.post('/types', isAuthenticated, isAdmin, (req, res) => {
    const { name, shape } = req.body;
    dynamicDataManager.createType(name, JSON.stringify(shape));
    res.status(200).send();
});

types.delete('/types/:typeName', isAuthenticated, isAdmin, (req, res) => {
    const { typeName } = req.params;
    const deletes = dynamicDataManager.deleteType(typeName);
    if (deletes === 0) {
        res.status(404).send();
        return;
    }
    res.status(200).send();
});

export default types;
