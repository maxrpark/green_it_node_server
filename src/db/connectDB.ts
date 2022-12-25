import mongoose from "mongoose";
mongoose.set("strictQuery", false);

const connectDB = (url: string) => {
    return mongoose.connect(url);
};

export = connectDB;
