const express = require('express');

const { createCommunity, getAllCommunities } = require('../controllers/communityController');
const validateToken = require('../middlewares/validateTokenHandler');
const router = express.Router();

router.post('/', validateToken, createCommunity);
router.get('/', getAllCommunities);

module.exports = router;
