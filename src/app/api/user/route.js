import { NextResponse } from 'next/server';
import connectDB from '@/dbConfig/dbConfig';
import User from '@/models/user';

// const getUserData = async (userId) => {

  
//   await connectDB();
//   const user = await User.findById(userId);
  
//   if (!user) {
//     throw new Error('User not found');
//   }
  
//   return {
//     id: user._id,
//     email: user.email,
//     username: user.username,
//     isVerified: user.isVerified,
//     isAcceptingMessages: user.isAcceptingMessages,
//     role: user.role,
//     money: user.money || 0,
//     profit: user.profit || 0,
//     transactions: user.transactions || [],
//     createdAt: user.createdAt
//   };
// };

// const updateUserFinances = async (userId, updateData) => {
//   await connectDB();
  
//   const updatedUser = await User.findByIdAndUpdate(
//     userId,
//     { $set: updateData },
//     { new: true, runValidators: true }
//   );
  
//   if (!updatedUser) {
//     throw new Error('Failed to update user finances');
//   }
  
//   return {
//     id: updatedUser._id,
//     email: updatedUser.email,
//     username: updatedUser.username,
//     isVerified: updatedUser.isVerified,
//     isAcceptingMessages: updatedUser.isAcceptingMessages,
//     role: updatedUser.role,
//     money: updatedUser.money || 0,
//     profit: updatedUser.profit || 0,
//     transactions: updatedUser.transactions || [],
//     createdAt: updatedUser.createdAt
//   };
// };

// GET: Fetch user data
export async function GET() {
  try {
    // Connect to the database before performing any operations
    await connectDB();
    
    // Now fetch all users
    const users = await User.find({}).select('-password');
    
    return NextResponse.json({
      success: true,
      message: "All users fetched",
      data: users,
    }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      message: 'Error in fetching users',
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// PATCH: Update user data
export async function PATCH(request) {
  try {
    // Connect to the database
    await connectDB();
    
    // Get user ID from the URL
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User ID is required"
      }, { status: 400 });
    }
    
    // Parse the request body
    const data = await request.json();
    const { money, profit, transactionType, amount, description, username, isAcceptingMessages } = data;
    
    // Create update object
    const updateData = {};
    
    // Get current user data
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found"
      }, { status: 404 });
    }
    
    // Update basic fields if provided
    if (username !== undefined) {
      updateData.username = username;
    }
    
    if (isAcceptingMessages !== undefined) {
      updateData.isAcceptingMessages = isAcceptingMessages;
    }
    
    // Initialize money and profit if they don't exist
    if (user.money === undefined) {
      updateData.money = 0;
    }
    
    if (user.profit === undefined) {
      updateData.profit = 0;
    }
    
    // Update financial fields if provided directly
    if (money !== undefined && !transactionType) {
      updateData.money = parseFloat(money);
    }
    
    if (profit !== undefined && !transactionType) {
      updateData.profit = parseFloat(profit);
    }
    
    // Add transaction if details provided
    if (transactionType && amount) {
      const parsedAmount = parseFloat(amount);
      const newTransaction = {
        type: transactionType,
        amount: parsedAmount,
        description: description || '',
        date: new Date()
      };
      
      // Initialize transactions array if it doesn't exist
      if (!user.transactions) {
        updateData.transactions = [newTransaction];
      } else {
        // Create a new array with the new transaction at the beginning
        updateData.transactions = [newTransaction, ...user.transactions];
      }
      
      // Update money and profit based on transaction type
      const currentMoney = user.money || 0;
      const currentProfit = user.profit || 0;
      
      if (transactionType === 'deposit') {
        updateData.money = parseFloat(currentMoney + parsedAmount);
      } else if (transactionType === 'withdrawal') {
        updateData.money = parseFloat(currentMoney - parsedAmount);
      } else if (transactionType === 'profit') {
        updateData.profit = parseFloat(currentProfit + parsedAmount);
        updateData.money = parseFloat(currentMoney + parsedAmount);
      } else if (transactionType === 'loss') {
        updateData.profit = parseFloat(currentProfit - parsedAmount);
        updateData.money = parseFloat(currentMoney - parsedAmount);
      }
    }
    
    // If no valid fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: false,
        message: "No valid fields to update"
      }, { status: 400 });
    }
    
    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    // Return updated user data
    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error.message);
    return NextResponse.json({
      message: 'Error updating user',
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST: Create a new user
export async function POST(request) {
  try {
    // Connect to the database
    await connectDB();
    
    // Parse the request body
    const data = await request.json();
    
    // Required fields validation
    const requiredFields = ['username', 'email', 'password'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({
          success: false,
          message: `${field} is required`
        }, { status: 400 });
      }
    }
    
    // Check if user with email already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "User with this email already exists"
      }, { status: 400 });
    }
    
    // Check if username is already taken
    const existingUsername = await User.findOne({ username: data.username });
    if (existingUsername) {
      return NextResponse.json({
        success: false,
        message: "Username is already taken"
      }, { status: 400 });
    }
    
    // Create a new user document directly
    const newUser = new User({
      username: data.username,
      email: data.email,
      password: data.password,
      money: 0,
      profit: 0,
      presentmoney: 0,
      transactions: [],
      role: data.role || 'user',
      isAcceptingMessages: true
    });
    
    // Explicitly set isVerified field
    newUser.isVerified = true;
    
    // Save the user to the database
    await newUser.save();
    
    // Get the saved user data
    const savedUser = await User.findById(newUser._id).lean();
    
    if (!savedUser) {
      throw new Error('Failed to retrieve saved user');
    }
    
    // Remove sensitive data
    delete savedUser.password;
    
    // Ensure isVerified is in the response
    if (savedUser.isVerified === undefined) {
      savedUser.isVerified = true;
    }
    
    // Log the created user
    console.log('Created user with isVerified:', savedUser.isVerified);
    console.log('Full user object:', savedUser);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: "User created successfully",
      data: savedUser
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error.message);
    return NextResponse.json({
      message: 'Error creating user',
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// DELETE: Delete a user
export async function DELETE(request) {
  try {
    // Connect to the database
    await connectDB();
    
    // Get user ID from the URL
    const url = new URL(request.url);
    const userId = url.searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User ID is required"
      }, { status: 400 });
    }
    
    // Find and delete the user
    const user = await User.findByIdAndDelete(userId);
    
    // Check if user was found and deleted
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found"
      }, { status: 404 });
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: "User deleted successfully"
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    return NextResponse.json({
      message: 'Error deleting user',
      success: false,
      error: error.message
    }, { status: 500 });
  }
}