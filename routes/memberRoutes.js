const express = require('express');
const validateToken = require('../middlewares/validateTokenHandler');
const { addMember, removeMember } = require('../controllers/memberController');
const router = express.Router();

router.post('/', validateToken, addMember);
router.delete('/:id', removeMember);

module.exports = router;