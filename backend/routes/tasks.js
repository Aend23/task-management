import express from 'express';
import { getCollection } from '../config/db.js';
import { ObjectId } from 'mongodb';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();


router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const collection = await getCollection('tasks');
        const tasks = await collection.find({ userId: user._id }).toArray();

        const formatTask = (task) => ({
            ...task,
            _id: task._id.toString(),
            userId: task.userId.toString()
        });

        const categorized = {
            pending: tasks.filter(t => t.status === 'Pending').map(formatTask),
            processing: tasks.filter(t => t.status === 'Processing').map(formatTask),
            completed: tasks.filter(t => t.status === 'Completed').map(formatTask)
        };

        res.json(categorized);
    } catch (err) {
        console.log("Error getting tasks", err);
        res.status(500).json({ error: "Error getting tasks" });
    }
});



router.post('/', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { title } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({ error: "Title is required" });
        }

        const collection = await getCollection('tasks');
        const task = await collection.insertOne({
            title: title.trim(),
            status: 'Pending',
            userId: user._id,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        res.json({ success: true, taskId: task.insertedId });
    } catch (err) {
        console.log("Error adding ", err);
        res.status(500).json({ error: "Error adding task" });
    }
});




router.put('/', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { taskId, title, status } = req.body;

        if (!taskId) {
            return res.status(400).json({ error: "Task ID required" });
        }

        const collection = await getCollection('tasks');
        const existingTask = await collection.findOne({ _id: new ObjectId(taskId) });

        

        if (!existingTask) {
            return res.status(404).json({ error: "Task not found" });
        }



        if (existingTask.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ error: "Unauthorized" });

        }


        const updates = { updatedAt: new Date() };
        if (title !== undefined) {
            if (title.trim() === '') {
                return res.status(400).json({ error: "Title cannot be empty" });
            }

            updates.title = title.trim();
        }


        if (status !== undefined) {
            const validStatuses = ['Pending', 'Processing', 'Completed'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }
            updates.status = status;
        }


        const result = await collection.updateOne(
            { _id: new ObjectId(taskId), userId: user._id },
            { $set: updates }
        );

        res.json({ success: true, result });
    } catch (err) {
        console.log("Error updating task", err);
        res.status(500).json({ error: "Error updating task" });
    }
});



router.delete('/', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { taskId } = req.body;


        if (!taskId) {
            return res.status(400).json({ error: "Task ID is required" });
        }


        const collection = await getCollection('tasks');
        const existingTask = await collection.findOne({ _id: new ObjectId(taskId) });


        if (!existingTask) {
            return res.status(404).json({ error: "Task not found" });
        }

        if (existingTask.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const result = await collection.deleteOne({ _id: new ObjectId(taskId), userId: user._id });

        res.json({ success: true, result });
    } catch (err) {
        console.log("Error deleting task", err);
        res.status(500).json({ error: "Error deleting task" });
    }
});

export default router;

