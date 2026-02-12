import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { usersTable } from "../models/user.model.js";
import { createHmac, randomBytes } from "node:crypto";
import jwt from 'jsonwebtoken';

export async function addNewUser(req, res) {
  const { name, email, password } = req.body;

  const existingUser = await db
    .select({
      email: usersTable.email,
    })
    .from(usersTable)
    .where((table) => eq(table.email, email));

  if (existingUser.length !== 0) {
    return res
      .status(400)
      .json({ error: `User with ${email} already exists!` });
  }

  const salt = randomBytes(256).toString("hex");
  const hashedPassword = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  const [user] = await db
    .insert(usersTable)
    .values({
      name,
      email,
      password: hashedPassword,
      salt,
    })
    .returning({ id: usersTable.id });

  return res.status(201).json({ status: "success", data: { userId: user.id } });
}

export async function loginUser(req, res) {
  const { email, password } = req.body;

  const [existingUser] = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      salt: usersTable.salt,
      password: usersTable.password,
    })
    .from(usersTable)
    .where((table) => eq(table.email, email));

  if (!existingUser) {
    res.status(404).json({
      error: `user with email ${email} doesn't exist. Please login first.`,
    });
  }

  const salt = existingUser.salt;
  const existingHash = existingUser.password;
  const newHashedPassword = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  if (newHashedPassword !== existingHash) {
    return res.status(400).json({ message: "Wrong Password!" });
  }

  // Create a session id for the logged in user!

  const payload = {
    id: existingUser.id,
    email: existingUser.email,
    name: existingUser.name
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET)

  return res
    .status(200)
    .json({ success: "Welcome back!", token });
}

export async function checkLoginStatus(req, res) {
  const user = req.user;

  if (!user) {
    return res.status(400).json({ error: "You are not logged In." });
  }

  return res.status(200).json({ user });
}

export async function updateUser(req, res) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: "You are not logged In." });
  }

  const {name} = req.body;


  await db.update(usersTable).set({name}).where(eq(usersTable.id, user.id ))

  return res.json({status: "success"})


}
