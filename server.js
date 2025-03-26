const express = require("express");
const math = require("mathjs");

const app = express();
app.use(express.json());

// Function to fix math expressions
function formatExpression(expression) {
    return expression
        .replace(/√(\d+)/g, "sqrt($1)")  // Replace √2 with sqrt(2)
        .replace(/×/g, "*")             // Replace × with *
        .replace(/÷/g, "/")             // Replace ÷ with /
        .replace(/π/g, "pi");           // Replace π with pi (for circles)
}

// API to solve any math expression
app.get("/calculate", (req, res) => {
    let { expression } = req.query;
    if (!expression) {
        return res.status(400).json({ error: "Expression required" });
    }

    try {
        expression = formatExpression(expression); // Format expression
        const result = math.evaluate(expression);  // Solve expression
        res.json({ expression, result });
    } catch (err) {
        res.status(400).json({ error: "Invalid expression" });
    }
});

// API for trigonometry calculations
app.get("/trigonometry", (req, res) => {
    const { func, value } = req.query;
    if (!func || !value) {
        return res.status(400).json({ error: "Function and value required" });
    }

    try {
        const result = math[func](math.unit(Number(value), "deg"));
        res.json({ function: func, value, result });
    } catch (err) {
        res.status(400).json({ error: "Invalid trigonometric function" });
    }
});

// API for algebra (quadratic formula)
app.get("/quadratic", (req, res) => {
    let { a, b, c } = req.query;
    if (!a || !b || !c) {
        return res.status(400).json({ error: "a, b, and c values required" });
    }

    try {
        a = Number(a);
        b = Number(b);
        c = Number(c);
        const discriminant = math.pow(b, 2) - 4 * a * c;
        if (discriminant < 0) {
            return res.json({ message: "No real solutions" });
        }
        const root1 = (-b + math.sqrt(discriminant)) / (2 * a);
        const root2 = (-b - math.sqrt(discriminant)) / (2 * a);
        res.json({ root1, root2 });
    } catch (err) {
        res.status(400).json({ error: "Invalid quadratic equation" });
    }
});

// API for circle area
app.get("/circle", (req, res) => {
    const { radius } = req.query;
    if (!radius) {
        return res.status(400).json({ error: "Radius required" });
    }

    try {
        const area = math.pi * math.pow(Number(radius), 2);
        res.json({ radius, area });
    } catch (err) {
        res.status(400).json({ error: "Invalid radius" });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Calculator API running on port ${PORT}`);
});
