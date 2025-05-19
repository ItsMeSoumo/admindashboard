import { NextResponse } from "next/server"
import { connectDB } from "@/dbConfig/dbConfig"
import contactModel from "@/models/contact.model"

export async function GET() {
    try {
        // Connect to the database before performing any operations
        await connectDB()
        
        // Now fetch the contacts
        const contacts = await contactModel.find({})
        
        return NextResponse.json({
            success: true,
            message: "All contacts fetched",
            data: contacts,
        }, { status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            message: 'Error in fetching contacts',
            success: false,
            error: error.message
        }, { status: 500 })
    }
}

export async function DELETE(request) {
    try {
        // Connect to the database
        await connectDB();
        
        // Get the contactId from the URL or request body
        const url = new URL(request.url);
        const contactId = url.searchParams.get('id');
        
        if (!contactId) {
            return NextResponse.json({
                success: false,
                message: "Contact ID is required"
            }, { status: 400 });
        }
        
        // Find and delete the contact
        const contact = await contactModel.findByIdAndDelete(contactId);
        
        if (!contact) {
            return NextResponse.json({
                success: false,
                message: "Contact not found"
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Contact deleted successfully"
        }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            message: 'Error deleting contact',
            success: false,
            error: error.message
        }, { status: 500 });
    }
}