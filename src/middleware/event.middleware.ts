import { Request, Response, NextFunction } from "express";


export const generateMiddleWare = (schema: any) => {
  return (req:Request , res: Response, next: NextFunction) => {
    // Middleware logic
    if (schema) {
      const result = schema.validate(req.body);
      // console.log("validator", result);
      if (!result.error) {
        console.log("input validation is successful");
      } else if (result.error) {
        console.log("error:", result.error.message);
        return res
          .status(422)
          .json({ message: "Validation error", errors: result.error.message });
      }
    } else {
      res.status(500).send("server error");
    }
    next();
  };
};


