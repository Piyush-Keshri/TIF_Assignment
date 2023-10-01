const express = require('express');

const { createCommunity, getAllCommunities, getAllMembers, getMyOwnedCommunity, getMyJoinedCommunities } = require('../controllers/communityController');
const validateToken = require('../middlewares/validateTokenHandler');
const router = express.Router();

router.post('/', validateToken, createCommunity);
router.get('/', getAllCommunities);
router.get('/:id/members', getAllMembers);
router.get('/me/owner', getMyOwnedCommunity);
router.get('/me/member', getMyJoinedCommunities);

module.exports = router;
