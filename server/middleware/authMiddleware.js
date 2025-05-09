import { clerkClient } from "@clerk/express";

// Middleware to check if the user is an educator
export const protectEducator = async (req, res, next) => {
    try {
        const userId = req.auth.userId;
        const response = await clerkClient.users.getUser(userId);
        
        if (response.publicMetadata.role !== 'educator') {
            return res.json({ success: false, message: 'You are not an educator' });
        }
        
        next();
    } catch (error) {
        res.json({ success: false, message: error.message });   
        
    }
}