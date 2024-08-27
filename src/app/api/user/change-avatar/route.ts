import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import { uploadToCloudinary } from "@/helpers/uploadToCloudinary";

export async function PUT(req: Request) {
  await dbConnect();

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, message: "No file provided" }),
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const _user: User = session?.user;

    if (!session || !_user) {
      return new Response(
        JSON.stringify({ success: false, message: "Not authenticated" }),
        { status: 401 }
      );
    }

    const userId = new mongoose.Types.ObjectId(_user._id);

    // Check if user exists and is verified
    const user = await UserModel.findById({ _id: userId });
    if (!user?.isVerified) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User does not exist or is not verified",
        }),
        { status: 400 }
      );
    }

    // Upload image to Cloudinary
    const fileBuffer = await file.arrayBuffer();
    const mimeType = file.type;
    const encoding = "base64";
    const base64Data = Buffer.from(fileBuffer).toString("base64");
    const fileUri = "data:" + mimeType + ";" + encoding + "," + base64Data;

    const uploadResult = await uploadToCloudinary(fileUri, file.name);
    if (!uploadResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error uploading image",
        }),
        { status: 500 }
      );
    }

    const imageUrl = uploadResult.result?.secure_url;

    // Update user's profile picture
    const updatedUser = await UserModel.findByIdAndUpdate(
      { _id: userId },
      { avatar: imageUrl },
      { new: true }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Profile picture updated successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error updating profile picture",
      }),
      { status: 500 }
    );
  }
}
