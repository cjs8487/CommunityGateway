import { Router } from 'express';
import { isAdmin, isAuthenticated } from '../../core/auth/AuthCore';
import { asyncManager, userManager } from '../../System';

const asyncs = Router({ mergeParams: true });

asyncs.get('/', (req, res) => {
    const asyncList = asyncManager.getAsyncList();
    res.status(200).send(asyncList);
});

asyncs.post('/', isAuthenticated, (req, res) => {
    if (!req.session.user) {
        res.status(403).send();
        return;
    }
    const { name, permalink, hash, time, comment } = req.body;
    if (!userManager.isAdmin(req.session.user) || time) {
        // apply extra rules for async creation by non-staff
        // non-staff asyncs must be created in parallel with a submission, and must be done
        // in a singe request to prevent inadvertently orphaning incomplete async records
        // this is also the route that will be followed when admins create & submit in a single call
        if (!time) {
            res.status(400).send();
            return;
        }
        const async = asyncManager.createAsync(name, permalink, hash, req.session.user);
        asyncManager.createSubmission(async as number, req.session.user, time, comment);
        res.status(201).send();
    }
    asyncManager.createAsync(name, permalink, hash, req.session.user);
    res.status(201).send();
});

asyncs.get('/:id', (req, res) => {
    const { id } = req.params;
    const idNUm = Number(id);
    if (Number.isNaN(idNUm)) {
        res.status(400).send();
    }
    const async = asyncManager.getAsync(idNUm);
    res.status(200).send(async);
});

asyncs.delete('/:id', isAuthenticated, isAdmin, (req, res) => {
    const { id } = req.params;
    const idNum = Number(id);
    if (Number.isNaN(idNum)) {
        res.status(400).send();
        return;
    }
    asyncManager.deleteAsync(idNum);
    res.status(200).send();
});

asyncs.get('/:id/submissions', (req, res) => {
    const { id } = req.params;
    const idNum = Number(id);
    if (Number.isNaN(idNum)) {
        res.status(400).send();
        return;
    }
    const submissions = asyncManager.getSubmissionsForAsync(idNum);
    res.status(200).send(submissions);
});

type PostSubmissionParams = {
    id: string;
}

type PostSubmissionBody = {
    time: string;
    comment: string;
}

asyncs.post<PostSubmissionParams, Record<string, never>, PostSubmissionBody>('/:id/submit', (req, res) => {
    const { id } = req.params;
    const { time, comment } = req.body;
    const idNum = Number(id);
    if (Number.isNaN(idNum)) {
        res.status(400).send();
        return;
    }
    if (!time.match(/^(?:\d{0,2}:){0,2}\d{0,2}$/)) {
        res.status(400).send();
        return;
    }
    if (!req.session.user) {
        res.status(401).send();
        return;
    }
    asyncManager.createSubmission(idNum, req.session.user, time, comment);
});

asyncs.delete('/submissions/:id', (req, res) => {
    const { id } = req.params;
    const idNum = Number(id);
    if (Number.isNaN(idNum)) {
        res.status(400).send();
        return;
    }
    const deleted = asyncManager.deleteSubmission(idNum);
    if (deleted === 0) {
        res.status(404).send();
    }
    res.status(200).send();
});

export default asyncs;
