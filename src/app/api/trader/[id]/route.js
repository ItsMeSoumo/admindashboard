import { NextResponse } from 'next/server';
import connectDB from '@/dbConfig/dbConfig';
import Trader from '@/models/trader.model';

// GET handler - fetch a specific trader by ID
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    // In Next.js App Router, params might be a promise
    const resolvedParams = await Promise.resolve(params);
    const traderId = resolvedParams.id;
    
    // Find the trader by ID
    const trader = await Trader.findById(traderId);
    
    if (!trader) {
      return NextResponse.json({ success: false, message: 'Trader not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: trader }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/trader/[id]:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE handler - delete a trader by ID
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    // In Next.js App Router, params might be a promise
    const resolvedParams = await Promise.resolve(params);
    const traderId = resolvedParams.id;
    
    // Find and delete the trader
    const deletedTrader = await Trader.findByIdAndDelete(traderId);
    
    if (!deletedTrader) {
      return NextResponse.json({ success: false, message: 'Trader not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Trader deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/trader/[id]:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT handler - update a trader by ID
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    // In Next.js App Router, params might be a promise
    const resolvedParams = await Promise.resolve(params);
    const traderId = resolvedParams.id;
    const body = await request.json();
    
    // Find and update the trader
    const updatedTrader = await Trader.findByIdAndUpdate(
      traderId,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!updatedTrader) {
      return NextResponse.json({ success: false, message: 'Trader not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: updatedTrader }, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/trader/[id]:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
