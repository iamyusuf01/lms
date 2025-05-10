import { v2 as cloudinary} from 'cloudinary';

const connectCoudinary =  async () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARI_NAME,
        api_key: process.env.CLOUDINARI_API_KEY,
        api_secret: process.env.CLOUDINARI_SECRET_KEY,
    });
}

export default connectCoudinary;