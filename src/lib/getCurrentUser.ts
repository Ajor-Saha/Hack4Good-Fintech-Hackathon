import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import UserModel from "@/model/User";
import { getServerSession, User } from "next-auth";


export const getCurrentUser = async () => {
    // Retrieve the current session
    const session = await getServerSession(authOptions);
  
    if (!session || !session.user || !session.user.email) {
      throw new Error("User is not authenticated");
    }
  
    // Use the session's user information to query the database
    const _user: User = session.user;
  
    // Assuming you're using MongoDB with Mongoose and your user schema has an _id
    const user = await UserModel.findOne({ email: _user.email });
  
    if (!user) {
      throw new Error("User not found");
    }
  
    return user;
  };