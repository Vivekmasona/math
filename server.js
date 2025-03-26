const express = require("express");
const math = require("mathjs");

const app = express();
app.use(express.json()); // JSON body parsing ke liye

// Evaluate API: Any math expression
app.get("/calculate", (req, res) => {
    const { expression } = req.query;
    if (!expression) {
        return res.status(400).json({ error: "Expression required" });
    }

    try {
        const result = math.evaluate(expression);
        res.json({ expression, result });
    } catch (err) {
        res.status(400).json({ error: "Invalid expression" });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Calculator API running on port ${PORT}`);
});
