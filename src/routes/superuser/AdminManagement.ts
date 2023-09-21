import { Router } from 'express';

const adminManagement = Router();

// gets the list of users with admin permissions
adminManagement.get('/list', (req, res) => {
    res.sendStatus(200);
});

// manage admin roles
adminManagement.get('/roles', (req, res) => {
    res.sendStatus(200);
});

adminManagement.post('roles', (req, res) => {
    res.sendStatus(200);
});

adminManagement.delete('roles', (req, res) => {
    res.sendStatus(200);
});

export default adminManagement;
