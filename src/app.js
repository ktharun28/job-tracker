require("dotenv").config();

const express = require("express");
const app = express();
const axios = require("axios");

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const API_BASE_URL =
    process.env.NODE_ENV === "production"
        ? "https://job-tracker.onrender.com"
        : "http://localhost:3000";



app.set("view engine", "ejs");
app.set("views", "./src/views");
app.use(express.static("src/public"));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 3000;

const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");

const frontendAuth = require("./middleware/frontendAuth");

const aiRoutes = require("./routes/aiRoutes");
app.use("/api/ai", aiRoutes);


app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", jobRoutes);


const authMiddleware = require("./middleware/AuthMiddleware");

app.get("/api/protected", authMiddleware, (req, res) => {
    res.json({
        message: "Access granted",
        user: req.user
    });
});


app.get("/", (req, res) => {
    res.send("Server + DB + Auth running.");
});

app.get("/test", (req, res) => {
    res.render("test");
});

app.get("/register", (req, res) => {
    res.render("auth/register");
});

app.get("/login", (req, res) => {
    res.render("auth/login");
});

app.get("/jobs", frontendAuth, async (req, res) => {
    try {
        const token = req.cookies.token;
        const selectedStatus = req.query.status || "All";

        const response = await axios.get(
            `${API_BASE_URL}/api/jobs`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        let jobs = response.data;

        // Filter jobs if status selected
        if (selectedStatus !== "All") {
            jobs = jobs.filter(job => job.status === selectedStatus);
        }

        // Dashboard counts
        const counts = {
            Applied: response.data.filter(j => j.status === "Applied").length,
            Interview: response.data.filter(j => j.status === "Interview").length,
            Offer: response.data.filter(j => j.status === "Offer").length,
            Rejected: response.data.filter(j => j.status === "Rejected").length
        };

        res.render("jobs/index", {
            jobs,
            counts,
            selectedStatus
        });

    } catch (error) {
        console.error("Fetch jobs error:", error.message);
        res.redirect("/login");
    }
});




app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Call backend API
        await axios.post(`${API_BASE_URL}/api/auth/register`, {
            name,
            email,
            password
        });

        // After successful registration
        res.redirect("/login");

    } catch (error) {
        console.error("Register error:", error.response?.data || error.message);
        res.send("Registration failed");
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const response = await axios.post(
            `${API_BASE_URL}/api/auth/login`,
            { email, password }
        );

        const token = response.data.token;

        // Store JWT in cookie
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict"
        });

        // Redirect after login
        res.redirect("/jobs");

    } catch (error) {
        console.error("Login error:", error.response?.data || error.message);
        res.send("Invalid email or password");
    }
});

app.post("/jobs", frontendAuth, async (req, res) => {
    try {
        const { company, role, status } = req.body;
        const token = req.cookies.token;

        await axios.post(
            `${API_BASE_URL}/api/jobs`,
            { company, role, status },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        res.redirect("/jobs");

    } catch (error) {
        console.error("Create job error:", error.response?.data || error.message);
        res.redirect("/jobs");
    }
});

app.post("/jobs/:id/delete", frontendAuth, async (req, res) => {
    try {
        const token = req.cookies.token;
        const jobId = req.params.id;

        await axios.delete(
            `${API_BASE_URL}/api/jobs/${jobId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        res.redirect("/jobs");

    } catch (error) {
        console.error("Delete job error:", error.response?.data || error.message);
        res.redirect("/jobs");
    }
});

app.get("/jobs/:id/edit", frontendAuth, async (req, res) => {
    try {
        const token = req.cookies.token;
        const jobId = req.params.id;

        const response = await axios.get(
            `${API_BASE_URL}/api/jobs`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const job = response.data.find(j => j.id == jobId);

        if (!job) return res.redirect("/jobs");

        res.render("jobs/edit", { job });

    } catch (error) {
        console.error("Edit page error:", error.message);
        res.redirect("/jobs");
    }
});


app.post("/jobs/:id/edit", frontendAuth, async (req, res) => {
    try {
        const token = req.cookies.token;
        const jobId = req.params.id;
        const { company, role, status } = req.body;

        await axios.put(
            `${API_BASE_URL}/api/jobs/${jobId}`,
            { company, role, status },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        res.redirect("/jobs");

    } catch (error) {
        console.error("Update job error:", error.response?.data || error.message);
        res.redirect("/jobs");
    }
});


app.get("/jobs/export", frontendAuth, async (req, res) => {
    try {
        const token = req.cookies.token;

        const response = await axios.get(
            `${API_BASE_URL}/api/jobs`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const jobs = response.data;

        // CSV header
        let csv = "Company,Role,Status,Applied Date\n";

        // CSV rows
        jobs.forEach(job => {
            csv += `"${job.company}","${job.role}","${job.status}","${job.applied_date}"\n`;
        });

        // Set headers for file download
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=job_applications.csv"
        );

        res.send(csv);

    } catch (error) {
        console.error("Export error:", error.message);
        res.redirect("/jobs");
    }
});

app.post("/ai/insight", frontendAuth, async (req, res) => {
    try {
        const token = req.cookies.token;

        const response = await axios.post(
            `${API_BASE_URL}/api/ai/insight`,
            req.body,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        res.render("ai/insight", {
            insight: response.data.insight
        });



    } catch (error) {
        res.send("AI insight failed");
    }
});




app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
});






app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});