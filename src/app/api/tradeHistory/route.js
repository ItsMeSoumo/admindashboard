import { NextResponse } from 'next/server';
import { connectDB } from '@/dbConfig/dbConfig';
import TradeHistory from '@/models/tradeHistory.model';
import Trader from '@/models/trader.model';
import User from '@/models/user';
import mongoose from 'mongoose';

// GET: Fetch trade history (all or by trader ID)
export async function GET(request) {
  try {
    // Connect to the database
    await connectDB();
    
    // Get parameters from query params
    const { searchParams } = new URL(request.url);
    const traderId = searchParams.get('traderId');
    const userId = searchParams.get('userId');
    const summary = searchParams.get('summary');
    
    // If summary parameter is provided, return weekly summary
    if (summary === 'weekly' && traderId) {
      // Check if trader exists
      const trader = await Trader.findById(traderId);
      if (!trader) {
        return NextResponse.json({
          success: false,
          message: 'Trader not found'
        }, { status: 404 });
      }

      // Aggregate trades by day of the week
      const weeklyTradeSummary = await TradeHistory.aggregate([
        {
          $match: {
            trader: new mongoose.Types.ObjectId(traderId)
          }
        },
        {
          $group: {
            _id: '$day',
            totalTrades: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            totalProfitLoss: { $sum: '$profitLoss' }
          }
        },
        {
          $project: {
            day: '$_id',
            totalTrades: 1,
            totalAmount: 1,
            totalProfitLoss: 1,
            _id: 0
          }
        },
        {
          $sort: {
            day: 1 // Sort by day of the week
          }
        }
      ]);

      // Create a complete week summary with all days
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const completeSummary = daysOfWeek.map(day => {
        const daySummary = weeklyTradeSummary.find(item => item.day === day);
        return daySummary || {
          day,
          totalTrades: 0,
          totalAmount: 0,
          totalProfitLoss: 0
        };
      });

      return NextResponse.json({
        success: true,
        message: 'Weekly trade summary retrieved successfully',
        data: completeSummary
      });
    } else {
      let query = {};
      
      // Filter by trader if traderId is provided
      if (traderId) {
        query.trader = traderId;
      }
      
      // Filter by user if userId is provided
      if (userId) {
        query.user = userId;
      }
      
      console.log('Trade history query:', query);
      
      // Fetch trade history with the specified query
      const tradeHistory = await TradeHistory.find(query)
        .sort({ date: -1 }) // Sort by date in descending order (newest first)
        .populate('trader', 'name email')
        .populate('user', 'username email money');
      
      return NextResponse.json({
        success: true,
        message: "Trade history fetched successfully",
        data: tradeHistory,
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching trade history:', error);
    return NextResponse.json({
      message: 'Error fetching trade history',
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST: Create a new trade record
export async function POST(request) {
  try {
    // Connect to the database
    await connectDB();
    
    // Parse the request body
    const data = await request.json();
    
    // Required fields validation
    const requiredFields = ['traderId', 'tradeType', 'amount', 'day'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({
          success: false,
          message: `${field} is required`
        }, { status: 400 });
      }
    }
    
    // Find the trader to validate and get assigned users
    const trader = await Trader.findById(data.traderId);
    if (!trader) {
      return NextResponse.json({
        success: false,
        message: 'Trader not found'
      }, { status: 404 });
    }
    
    // Get the first assigned user if available
    const userId = trader.assignedUsers && trader.assignedUsers.length > 0 
      ? trader.assignedUsers[0] 
      : null;
    
    console.log('Creating trade with data:', {
      ...data,
      trader: data.traderId,
      user: userId
    });
    
    // Validate trader ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(data.traderId)) {
      console.error('Invalid trader ID format:', data.traderId);
      return NextResponse.json({
        success: false,
        message: 'Invalid trader ID format'
      }, { status: 400 });
    }
    
    // Create a new trade history record
    const newTradeRecord = new TradeHistory({
      trader: data.traderId,
      user: userId,
      tradeType: data.tradeType,
      amount: Number(data.amount),
      profitLoss: Number(data.profitLoss) || 0,
      day: data.day,
      date: data.date || new Date()
    });
    
    console.log('TradeHistory model created:', newTradeRecord);
    
    try {
      // Save the trade record to the database
      const savedRecord = await newTradeRecord.save();
      console.log('Trade record saved successfully:', savedRecord);
      
      // Update trader's totalTrades and profitGenerated
      trader.totalTrades += 1;
      trader.profitGenerated += Number(data.profitLoss) || 0;
      await trader.save();
    } catch (error) {
      console.error('Error creating trade record:', error);
      return NextResponse.json({
        success: false,
        message: 'Error creating trade record',
        error: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: "Trade record created successfully",
      data: newTradeRecord
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating trade record:', error.message);
    return NextResponse.json({
      message: 'Error creating trade record',
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// DELETE: Delete a trade record
export async function DELETE(request) {
  try {
    // Connect to the database
    await connectDB();
    
    // Get the trade ID from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Trade ID is required'
      }, { status: 400 });
    }
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid trade ID format'
      }, { status: 400 });
    }
    
    // Find the trade record to get associated trader
    const tradeRecord = await TradeHistory.findById(id);
    
    if (!tradeRecord) {
      return NextResponse.json({
        success: false,
        message: 'Trade record not found'
      }, { status: 404 });
    }
    
    // Store trader ID for updating stats later
    const traderId = tradeRecord.trader;
    const profitLoss = tradeRecord.profitLoss || 0;
    
    // Delete the trade record
    const deleteResult = await TradeHistory.findByIdAndDelete(id);
    
    if (!deleteResult) {
      return NextResponse.json({
        success: false,
        message: 'Failed to delete trade record'
      }, { status: 500 });
    }
    
    // Update trader's stats (decrement totalTrades and subtract profitGenerated)
    const trader = await Trader.findById(traderId);
    if (trader) {
      trader.totalTrades = Math.max(0, trader.totalTrades - 1);
      trader.profitGenerated -= profitLoss;
      await trader.save();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Trade record deleted successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting trade record:', error);
    return NextResponse.json({
      success: false,
      message: 'Error deleting trade record',
      error: error.message
    }, { status: 500 });
  }
}
