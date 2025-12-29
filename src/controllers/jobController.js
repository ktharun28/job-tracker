const pool = require("../config/db");

exports.getJobs = async (req, res) => {
    try {
        const userId = req.user.id;

        console.log("Logged in user id:", userId);


        const jobs = await pool.query(
            "SELECT * FROM jobs WHERE user_id = $1",
            [userId]
        );

        res.json(jobs.rows);
    } catch(error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.createJob = async (req, res) => {
    try {
        const { company, role, status } = req.body;

        // basic validation
        if (!company || !role) {
            return res.status(400).json({ message: "Company and role are required" });
        }

        const userId = req.user.id;

        const newJob = await pool.query(
            `INSERT INTO jobs (user_id, company, role, status)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [userId, company, role, status]
        );

        res.status(201).json(newJob.rows[0]);

    } catch (error) {
        console.error("Create job error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const { company, role, status } = req.body;
        const userId = req.user.id;

        const updatedJob = await pool.query(
            `UPDATE jobs
             SET company = $1, role = $2, status = $3
             WHERE id = $4 AND user_id = $5
             RETURNING *`,
            [company, role, status, jobId, userId]
        );

        if (updatedJob.rows.length === 0) {
            return res.status(404).json({ message: "Job not found or unauthorized" });
        }

        res.json(updatedJob.rows[0]);

    } catch (error) {
        console.error("Update job error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.user.id;

        const deletedJob = await pool.query(
            `DELETE FROM jobs
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [jobId, userId]
        );

        if (deletedJob.rows.length === 0) {
            return res.status(404).json({ message: "Job not found or unauthorized" });
        }

        res.json({ message: "Job deleted successfully" });

    } catch (error) {
        console.error("Delete job error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
