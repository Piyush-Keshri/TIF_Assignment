const express = require("express");
const { createRole, getAllRoles } = require("../controllers/roleController");

const router = express.Router();

router.post('/', createRole);
router.get('/', getAllRoles);

module.exports = router;