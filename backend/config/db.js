import dotenv from "dotenv";
import { MongoClient } from 'mongodb';
dotenv.config();

const uri = process.env.MONGODB_URI;
console.log(process.env.JWT_SECRET)


if (!uri) {
    throw new Error('MONGODB_URI is not set');
}

const options = {};

const client = new MongoClient(uri, options);
let clientPromise = null;

export async function connectDB() {
    if (!clientPromise) {
        clientPromise = client.connect();
    }
    return clientPromise;
}

export async function getCollection(collectionName) {
    const client = await connectDB();
    const db = client.db("task-managment");
    return db.collection(collectionName);
}

