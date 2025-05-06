import mongoose from "mongoose";
import dotenv from "dotenv";

// Load .env variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URL;
        console.log("Connecting to MongoDB with URI:", mongoURI); // 🔍 Debug log

        if (!mongoURI) {
            throw new Error("MONGODB_URL is undefined. Please check your .env file.");
        }

        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("✅ Database Connected");
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
};

export default connectDB;
