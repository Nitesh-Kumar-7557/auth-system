import "dotenv/config";
import express from "express";
import { router } from "./routes/user.routes.js";
import jwt from "jsonwebtoken";

const app = express();
app.listen(process.env.POST ?? 8000, () =>
  console.log("server is up and running..."),
);
app.use(express.json());

app.use(async function (req, res, next) {
  try {
    // Header Authorization: Bearer <TOKEN>
    const tokenHeader = req.headers["authorization"];
    if (!tokenHeader) {
      return next();
    }

    if (!tokenHeader.startsWith("Bearer")) {
      return res
        .status(400)
        .json({ error: "authorization header must start with Bearer" });
    }

    const token = tokenHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    next();
  }
});

app.use("/user", router);
