const express = require("express");
const math = require("mathjs");

const app = express();
app.use(express.json());

// Predefined trigonometric values
const trigTable = {
    "sin0": "0", "cos0": "1", "tan0": "0", "csc0": "~", "sec0": "1", "cot0": "~",
    "sin30": "1/2", "cos30": "√3/2", "tan30": "1/√3", "csc30": "2", "sec30": "2/√3", "cot30": "√3",
    "sin45": "1/√2", "cos45": "1/√2", "tan45": "1", "csc45": "√2", "sec45": "√2", "cot45": "1",
    "sin60": "√3/2", "cos60": "1/2", "tan60": "√3", "csc60": "2/√3", "sec60": "2", "cot60": "1/√3",
    "sin90": "1", "cos90": "0", "tan90": "~", "csc90": "1", "sec90": "~", "cot90": "0",
    "sin120": "√3/2", "cos120": "-1/2", "tan120": "-√3", "csc120": "2/√3", "sec120": "-2", "cot120": "-1/√3",
    "sin135": "1/√2", "cos135": "-1/√2", "tan135": "-1", "csc135": "√2", "sec135": "-√2", "cot135": "-1",
    "sin150": "1/2", "cos150": "-√3/2", "tan150": "-1/√3", "csc150": "2", "sec150": "-2/√3", "cot150": "-√3"
};

// Function to format math expressions properly
function formatExpression(expression) {
    return expression
        .replace(/(\d)\s+(\d)/g, "$1+$2") // Convert "2 2" → "2+2"
        .replace(/(\d)\+(\d)/g, "$1+$2")  // Convert "2+2" → "2+2" (Ensure format)
        .replace(/√(\d+)/g, "sqrt($1)")   // Replace √2 with sqrt(2)
        .replace(/×/g, "*")               // Replace × with *
        .replace(/÷/g, "/")               // Replace ÷ with /
        .replace(/π/g, "pi")              // Replace π with pi
        .replace(/%/g, "/100");           // Convert percentage
}

// API to solve any math expression
app.get("/calculate", (req, res) => {
    let { expression } = req.query;
    if (!expression) {
        return res.status(400).json({ error: "Expression required", destination: req.originalUrl });
    }

    try {
        expression = decodeURIComponent(expression); // Decode URL encoding
        expression = formatExpression(expression);   // Format expression
        const result = math.evaluate(expression);    // Solve expression

        res.json({
            destination: req.originalUrl,
            expression,
            result
        });
    } catch (err) {
        res.status(400).json({ error: "Invalid expression", destination: req.originalUrl });
    }
});

// API for trigonometry calculations (Predefined values)
app.get("/trigonometry", (req, res) => {
    let { func } = req.query;
    if (!func) {
        return res.status(400).json({ error: "Function required", destination: req.originalUrl });
    }

    func = func.replace("°", ""); // Remove ° symbol if present

    if (trigTable[func]) {
        res.json({
            destination: req.originalUrl,
            function: func,
            result: trigTable[func]
        });
    } else {
        res.status(400).json({ error: "Invalid trigonometric function or value", destination: req.originalUrl });
    }
});

// API for dynamic trigonometry calculations
app.get("/trig", (req, res) => {
    const { func, value } = req.query;
    if (!func || !value) {
        return res.status(400).json({ error: "Function and value required", destination: req.originalUrl });
    }

    try {
        const result = math[func](math.unit(Number(value), "deg"));
        res.json({
            destination: req.originalUrl,
            function: func,
            value,
            result
        });
    } catch (err) {
        res.status(400).json({ error: "Invalid trigonometric function", destination: req.originalUrl });
    }
});

// API for solving quadratic equations
app.get("/quadratic", (req, res) => {
    let { a, b, c } = req.query;
    if (!a || !b || !c) {
        return res.status(400).json({ error: "a, b, and c values required", destination: req.originalUrl });
    }

    try {
        a = Number(a);
        b = Number(b);
        c = Number(c);
        const discriminant = math.pow(b, 2) - 4 * a * c;
        if (discriminant < 0) {
            return res.json({ message: "No real solutions", destination: req.originalUrl });
        }
        const root1 = (-b + math.sqrt(discriminant)) / (2 * a);
        const root2 = (-b - math.sqrt(discriminant)) / (2 * a);
        res.json({ destination: req.originalUrl, root1, root2 });
    } catch (err) {
        res.status(400).json({ error: "Invalid quadratic equation", destination: req.originalUrl });
    }
});

// API for calculating the area of a circle
app.get("/circle", (req, res) => {
    const { radius } = req.query;
    if (!radius) {
        return res.status(400).json({ error: "Radius required", destination: req.originalUrl });
    }

    try {
        const area = math.pi * math.pow(Number(radius), 2);
        res.json({ destination: req.originalUrl, radius, area });
    } catch (err) {
        res.status(400).json({ error: "Invalid radius", destination: req.originalUrl });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Calculator API running on port ${PORT}`);
});
