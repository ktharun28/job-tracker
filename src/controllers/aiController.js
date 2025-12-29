const geminiModel = require("../config/ai");

exports.getJobInsight = async (req, res) => {
    try {
        const { company, role, status } = req.body;

        const prompt = `
            Give 3 interview preparation tips for a ${role} role at ${company}.
            Each point should be on a new line.
            Put serial number for each point.
            Remove the astrieks.
            Keep it short and practical.
            `;


        const result = await geminiModel.generateContent(prompt);
        const response = result.response.text();

        res.json({
            insight: response
        });

    } catch (error) {
        console.error("Gemini AI error:", error.message);
        res.status(500).json({ message: "AI generation failed" });
    }
};
