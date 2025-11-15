import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = req.user;


        res.json({
            _id: user._id.toString(),
            name: user.name,
            email: user.email
        });

    } catch (err) {
        console.error("Error user", err);
        res.status(500).json({ error: "Error user" });
    }

});



export default router;

