const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/AuthMiddleware");
const { getJobs, createJob, updateJob, deleteJob } = require("../controllers/jobController");


router.get("/jobs", authMiddleware, getJobs);
router.post("/jobs", authMiddleware, createJob);
router.put("/jobs/:id", authMiddleware, updateJob);
router.delete("/jobs/:id", authMiddleware, deleteJob);


module.exports = router;