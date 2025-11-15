import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getCollection } from '../config/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    try {
        const { email, name, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const collection = await getCollection('users');

        const existingUser = await collection.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'User Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await collection.insertOne({
            name,
            email,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        res.status(201).json({ message: "user created", user: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password required" });
        }

        const collection = await getCollection('users');
        const user = await collection.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie('token', token, {
            httpOnly: true,
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ message: "Login successful" });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/logout', (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        path: '/',
        maxAge: 0
    });
    res.json({ message: "logged out" });
});

export default router;

