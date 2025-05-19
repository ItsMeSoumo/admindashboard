import { NextResponse } from "next/server"
import { connectDB } from "@/dbConfig/dbConfig"
import devModel from "@/models/dev.model"

export async function GET() {
    try {
        // Connect to the database before performing any operations
        await connectDB()
        
        // Now fetch the Dev entries
        const devEntries = await devModel.find({})
        
        return NextResponse.json({
            success: true,
            message: "All Dev entries fetched",
            data: devEntries,
        }, { status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            message: 'Error in fetching Dev entries',
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
        const entry = await devModel.findByIdAndDelete(entryId);
        
        if (!entry) {
            return NextResponse.json({
                success: false,
                message: "Entry not found"
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Dev entry deleted successfully"
        }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            message: 'Error deleting Dev entry',
            success: false,
            error: error.message
        }, { status: 500 });
    }
}