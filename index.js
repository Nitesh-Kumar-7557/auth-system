import "dotenv/config";
import express from "express";
import { router } from "./routes/user.routes.js";
import { db } from "./db/index.js";
import { userSessions, usersTable } from "./models/user.model.js";
import { eq } from "drizzle-orm";

const app = express();
app.listen(process.env.POST ?? 8000, () =>
  console.log("server is up and running..."),
);
app.use(express.json());

app.use(async function (req, res, next) {
  const sessionId = req.headers["session-id"];
  if (!sessionId) {
    return next();
  }

  const [data] = await db
    .select({
        sessionId: userSessions.id,
      id: usersTable.id,
      userId: userSessions.userId,
      name: usersTable.name,
      email: usersTable.email,
    })
    .from(userSessions)
    .rightJoin(usersTable, eq(usersTable.id, userSessions.userId))
    .where((table) => eq(table.sessionId, sessionId));

  if (!data) {
    return next();
  }

  req.user = data;
  return next();
});

app.use("/user", router);
