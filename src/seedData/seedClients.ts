import mongoose from 'mongoose';
import { Client } from '../models/Client'; // Adjust the import based on your structure
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const sampleClients = [
    {
        companyName: 'Acme Corp',
        contactName: 'John Doe',
        email: 'john.doe@acmecorp.com',
        phone: '123-456-7890',
        address: '123 Acme St, Springfield',
        industry: 'Manufacturing',
        businessSize: 'Large',
        currentWebsite: 'http://www.acmecorp.com',
        projectType: 'business',
        projectScope: {
            estimatedPages: 5,
            features: ['Contact Form', 'E-commerce'],
            targetLaunchDate: new Date('2023-12-01'),
            budgetRange: {
                min: 5000,
                max: 15000,
            },
        },
        businessDetails: {
            description: 'A leading manufacturing company.',
            targetAudience: 'Businesses',
            uniqueSellingPoints: ['Quality', 'Reliability'],
        },
        technicalRequirements: {
            domainStatus: 'needed',
            domainName: 'acmecorp.com',
            hostingPreference: 'AWS',
            requiredIntegrations: ['Payment Gateway'],
        },
        contentDetails: {
            contentProvider: 'client',
            mediaNeeds: {
                stockPhotos: true,
                customPhotography: false,
                videoContent: false,
            },
        },
        communication: {
            preferredMethod: 'email',
            timezone: 'UTC',
        },
        status: 'lead',
        createdBy: new mongoose.Types.ObjectId(),
        lastUpdatedBy: new mongoose.Types.ObjectId(),
    },
    {
        companyName: 'Beta LLC',
        contactName: 'Jane Smith',
        email: 'jane.smith@betallc.com',
        phone: '987-654-3210',
        address: '456 Beta Ave, Springfield',
        industry: 'Technology',
        businessSize: 'Medium',
        currentWebsite: 'http://www.betallc.com',
    },
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!); // Use the environment variable

        await Client.deleteMany({}); // Clear existing clients
        await Client.insertMany(sampleClients); // Insert sample clients

        console.log('Sample clients added successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.connection.close(); // Close the connection
    }
};

seedDatabase();
