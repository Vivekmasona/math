const express = require("express");
const math = require("mathjs");

const app = express();
app.use(express.json());

// Function to replace mathematical symbols with math.js compatible format
function formatExpression(expression) {
    return expression
        .replace(/√(\d+)/g, "sqrt($1)")  // Replace √2 with sqrt(2)
        .replace(/×/g, "*")             // Replace × with *
        .replace(/÷/g, "/");            // Replace ÷ with /
}

// Evaluate API
app.get("/calculate", (req, res) => {
    let { expression } = req.query;
    if (!expression) {
        return res.status(400).json({ error: "Expression required" });
    }

    try {
        expression = formatExpression(expression); // Fix expression
        const result = math.evaluate(expression);  // Evaluate math
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
