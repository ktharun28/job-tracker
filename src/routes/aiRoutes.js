const express = require("express");
const router = express.Router();
const { getJobInsight } = require("../controllers/aiController");
const authMiddleware = require("../middleware/AuthMiddleware");

router.post("/insight", authMiddleware, getJobInsight);

module.exports = router;
