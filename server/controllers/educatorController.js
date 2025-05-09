import {clerkClient} from '@clerk/express';
import Course from '../models/Course.js';
import { v2 as cloudinary } from 'cloudinary';
import Purchase from '../models/Purchase.js';
import User from '../models/User.js';

export const updateRoleEducator = async (req, res) => {
    try {
        const userId = req.auth.userId;

        await clerkClient.users.updateUser(userId, {
            publicMetadata: {
                role: 'educator',
            }
        });

        res.json({ success: true , message: 'You can publish a course now' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

//Add a new course course
export const addCourse = async (req, res) => {
    try {
        const {courseData} = req.body;
        const imageFile = req.file;
        const educatorId = req.auth.userId;

        if(!imageFile){
            return res.json({success: false, message: 'Thumbnail not attcahed'});
        }

        const parseCourseData = await JSON.parse(courseData);
        parseCourseData.educator = educatorId
        const newCourse = await Course.create(parseCourseData);
        const imageUpload =  await cloudinary.uploader.upload(imageFile.path)
        newCourse.courseThumbnail = imageUpload.secure_url;
        await newCourse.save();

        res.json({success: true, message: 'Course added Successfully'});
         
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}
 
// Get all courses of educator
export const getEducatorCourses = async (req, res) => {
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({ educator: educator });
        res.json({ success: true, courses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get Educator DashBoard Data (Total Earning, Enrollerd Students, no. of courses)
export const educatorDashboardData = async (req, res) => {
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({ educator: educator });
        let totalCourses = courses.length;

        const courseIds = courses.map(course => course._id);
        // Calculate total earning, purchases
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed',
        })

        const totalEarning = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

        // Callect unique enrolled students ids with their course titles
        const entrolledStudentsData = [];
        for(const course of courses){
            const students = await User.find({
                _id: { $in: course.enrolledStudents },
            }, 'name imageUrl');
            students.forEach(student => {
                entrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student,
                })
            })
        }

        res.json({success: true, dashboardData: { totalCourses, totalEarning, entrolledStudentsData }});


    } catch (error) {
       res.json({ success: false, message: error.message }); 
    }
}

//Get all Enrolled Students Data with Purchases
export const getEnrolledStudentsData = async (req, res) => {
    try {
        
        const educator = req.auth.userId;
        const courses = await Course.find({ educator });
        const courseIds = courses.map(course => course._id);

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed',
        }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle');

        const enrolledStudents = purchases.map(purchase => ({ 
                student: purchase.userId,
                course: purchase.courseId,
                purchaseDate: purchase.createdAt,    
        }));
        
        res.json({ success: true, enrolledStudents });
          
    } catch (error) {
        res.json({ success: false, message: error.message });
        
    }
}