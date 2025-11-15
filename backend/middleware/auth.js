import jwt from "jsonwebtoken";
import { getCollection } from "../config/db.js";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET;



export async function authenticateToken(req, res, next) {
    try {

        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const users = await getCollection("users");
        const user = await users.findOne({ _id: new ObjectId(decoded.userId) });



        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        req.user = user;
        next();

    } catch (err) {
        console.error("verifying JWT:", err);
        return res.status(401).json({ error: "unauthorized" });
    }
}

