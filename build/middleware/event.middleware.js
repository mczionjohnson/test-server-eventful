"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMiddleWare = void 0;
const generateMiddleWare = (schema) => {
    return (req, res, next) => {
        // Middleware logic
        if (schema) {
            const result = schema.validate(req.body);
            // console.log("validator", result);
            if (!result.error) {
                console.log("input validation is successful");
            }
            else if (result.error) {
                console.log("error:", result.error.message);
                return res
                    .status(422)
                    .json({ message: "Validation error", errors: result.error.message });
            }
        }
        else {
            res.status(500).send("server error");
        }
        next();
    };
};
exports.generateMiddleWare = generateMiddleWare;
