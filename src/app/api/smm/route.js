import { NextResponse } from "next/server"
import { connectDB } from "@/dbConfig/dbConfig"
import smmModel from "@/models/smm.model"

export async function GET() {
    try {
        // Connect to the database before performing any operations
        await connectDB()
        
        // Now fetch the SMM entries
        const smmEntries = await smmModel.find({})
        
        return NextResponse.json({
            success: true,
            message: "All SMM entries fetched",
            data: smmEntries,
        }, { status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            message: 'Error in fetching SMM entries',
            success: false,
            error: error.message
        }, { status: 500 })
    }
}

export async function DELETE(request) {
    try {
        // Connect to the database
        await connectDB();
        
        // Get the entryId from the URL or request body
        const url = new URL(request.url);
        const entryId = url.searchParams.get('id');
        
        if (!entryId) {
            return NextResponse.json({
                success: false,
                message: "Entry ID is required"
            }, { status: 400 });
        }
        
        // Find and delete the entry
        const entry = await smmModel.findByIdAndDelete(entryId);
        
        if (!entry) {
            return NextResponse.json({
                success: false,
                message: "Entry not found"
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "SMM entry deleted successfully"
        }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            message: 'Error deleting SMM entry',
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
