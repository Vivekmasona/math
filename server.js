const express = require("express");
const cors = require("cors");
const math = require("mathjs");

const app = express();
app.use(cors());
app.use(express.json());

// 🎯 **Predefined Trigonometric Values**
const trigTable = {
    "sin0": "0", "cos0": "1", "tan0": "0", "csc0": "~", "sec0": "1", "cot0": "~",
    "sin30": "1/2", "cos30": "√3/2", "tan30": "1/√3", "csc30": "2", "sec30": "2/√3", "cot30": "√3",
    "sin45": "1/√2", "cos45": "1/√2", "tan45": "1", "csc45": "√2", "sec45": "√2", "cot45": "1",
    "sin60": "√3/2", "cos60": "1/2", "tan60": "√3", "csc60": "2/√3", "sec60": "2", "cot60": "1/√3",
    "sin90": "1", "cos90": "0", "tan90": "~", "csc90": "1", "sec90": "~", "cot90": "0"
};

// 🎯 **Math Expression Formatter**
function formatExpression(expression) {
    return expression
        .replace(/(\d)\s+(\d)/g, "$1+$2") // Space ko "+" se replace karo
        .replace(/√(\d+)/g, "sqrt($1)")   // √ ko sqrt() me convert karo
        .replace(/×/g, "*")               // × ko * me convert karo
        .replace(/÷/g, "/")               // ÷ ko / me convert karo
        .replace(/π/g, "pi")              // π ko pi me convert karo
        .replace(/%/g, "/100");           // % ko divide by 100 karo
}

// 🎯 **Universal Math Solver API**
app.get("/solve", (req, res) => {
    let { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: "Query is required", destination: req.originalUrl });
    }

    query = decodeURIComponent(query).replace("°", ""); // ° symbol hataye

    try {
        // 🔢 **1. Predefined Trigonometric Table Check**
        if (trigTable[query]) {
            return res.json({
                destination: req.originalUrl,
                type: "Trigonometry (Predefined)",
                function: query,
                result: trigTable[query]
            });
        }

        // 📐 **2. Dynamic Trigonometry Calculation**
        const trigMatch = query.match(/(sin|cos|tan|csc|sec|cot)(\d+)/);
        if (trigMatch) {
            const func = trigMatch[1];
            const value = parseFloat(trigMatch[2]);
            const result = math[func](math.unit(value, "deg"));
            return res.json({
                destination: req.originalUrl,
                type: "Trigonometry (Calculated)",
                function: func,
                value,
                result
            });
        }

        // 🏀 **3. Quadratic Equation Solver (ax² + bx + c = 0)**
        const quadMatch = query.match(/(-?\d*)x\^2\s*([\+\-]\s*\d*)x\s*([\+\-]\s*\d*)/);
        if (quadMatch) {
            let a = parseFloat(quadMatch[1] || "1");
            let b = parseFloat(quadMatch[2].replace(/\s+/g, ""));
            let c = parseFloat(quadMatch[3].replace(/\s+/g, ""));

            const discriminant = math.pow(b, 2) - 4 * a * c;
            if (discriminant < 0) {
                return res.json({ message: "No real solutions", destination: req.originalUrl, type: "Quadratic Equation" });
            }
            const root1 = (-b + math.sqrt(discriminant)) / (2 * a);
            const root2 = (-b - math.sqrt(discriminant)) / (2 * a);
            return res.json({
                destination: req.originalUrl,
                type: "Quadratic Equation",
                equation: query,
                root1,
                root2
            });
        }

        // ⚪ **4. Circle Area Calculation (πr²)**
        const circleMatch = query.match(/area\s*of\s*circle\s*with\s*radius\s*(\d+)/i);
        if (circleMatch) {
            const radius = parseFloat(circleMatch[1]);
            const area = math.pi * math.pow(radius, 2);
            return res.json({
                destination: req.originalUrl,
                type: "Circle Area",
                radius,
                area
            });
        }

        // 🏆 **5. General Math Expression Solver**
        query = formatExpression(query);
        const result = math.evaluate(query);
        return res.json({
            destination: req.originalUrl,
            type: "Math Expression",
            expression: query,
            result
        });
    } catch (err) {
        res.status(400).json({ error: "Invalid query", destination: req.originalUrl });
    }
});

// 🎯 **Start Server**
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Universal Solver API running on port ${PORT}`);
});
