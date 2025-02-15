const express = require('express');
const { add, index, view, deleteData, deleteMany } = require('./meeting');
const auth = require('../../middelwares/auth');

const router = express.Router();

router.post('/', auth, add);
router.get('/', auth, index);
router.get('/:id', auth, view);
router.delete('/:id', auth, deleteData);
router.post('/deleteMany', auth, deleteMany);

module.exports = router;
