import { NextResponse } from 'next/server';
import connectDB from '@/dbConfig/dbConfig';
import Trader from '@/models/trader.model';

// GET handler - fetch all traders or a specific trader by ID
export async function GET(request) {
  try {
    await connectDB();
    
    // Check if there's an ID query parameter
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    let data;
    if (id) {
      // Fetch a specific trader by ID
      data = await Trader.findById(id);
      if (!data) {
        return NextResponse.json({ success: false, message: 'Trader not found' }, { status: 404 });
      }
    } else {
      // Fetch all traders
      data = await Trader.find({}).sort({ createdAt: -1 });
    }
    
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/trader:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST handler - create a new trader
export async function POST(request) {
  try {
    await connectDB();
    
    // Parse the request body
    const body = await request.json();
    
    // Create a new trader
    const newTrader = await Trader.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      password: body.password,
      totalTrades: body.totalTrades || 0,
      profitGenerated: body.profitGenerated || 0,
      isVerified: body.isVerified !== undefined ? body.isVerified : true,
      assignedUsers: body.assignedUsers || [],
      role: body.role || 'trader'
    });
    
    return NextResponse.json({ success: true, data: newTrader }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/trader:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE handler - delete a trader by ID
export async function DELETE(request) {
  try {
    await connectDB();
    
    // Check if there's an ID query parameter
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, message: 'Trader ID is required' }, { status: 400 });
    }
    
    // Delete the trader
    const deletedTrader = await Trader.findByIdAndDelete(id);
    
    if (!deletedTrader) {
      return NextResponse.json({ success: false, message: 'Trader not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Trader deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/trader:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
