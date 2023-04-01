import { Router } from 'express';
import { asyncManager } from 'src/System';

const asyncs = Router();

asyncs.get('/', (req, res) => {
    const asyncList = asyncManager.getAsyncList();
    res.status(200).send(asyncList);
});

export default asyncs;
