import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
    // Basic Information
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
    industry: string;
    businessSize: string;
    currentWebsite?: string;
    
    // Project Details
    projectType: 'business' | 'ecommerce' | 'portfolio' | 'blog' | 'custom';
    projectScope: {
        estimatedPages: number;
        features: string[];
        targetLaunchDate: Date;
        budgetRange: {
            min: number;
            max: number;
        };
    };

    // Business Details
    businessDetails: {
        description: string;
        missionStatement?: string;
        targetAudience: string;
        uniqueSellingPoints: string[];
        competitors?: string[];
    };

    // Technical Requirements
    technicalRequirements: {
        domainStatus: 'needed' | 'existing';
        domainName?: string;
        hostingPreference?: string;
        requiredIntegrations?: string[];
    };

    // Content Details
    contentDetails: {
        contentProvider: 'client' | 'codeweaver' | 'mixed';
        mediaNeeds: {
            stockPhotos: boolean;
            customPhotography: boolean;
            videoContent: boolean;
        };
        seoRequirements?: string[];
    };

    // Project Status
    status: 'lead' | 'proposal' | 'active' | 'completed' | 'maintenance';
    assignedPackage?: 'basic' | 'professional' | 'ecommerce' | 'enterprise';
    projectValue?: number;
    
    // Timestamps and Notes
    notes: [{
        content: string;
        date: Date;
        author: mongoose.Types.ObjectId;
    }];
    createdAt: Date;
    updatedAt: Date;

    // Add these to the IClient interface
    assignedTo?: mongoose.Types.ObjectId;  // Reference to User (admin)
    createdBy: mongoose.Types.ObjectId;    // Reference to User who created
    lastUpdatedBy: mongoose.Types.ObjectId; // Track who last modified

    projectTimeline: {
        proposalSent?: Date;
        proposalAccepted?: Date;
        projectStarted?: Date;
        projectCompleted?: Date;
        maintenanceStarted?: Date;
    };

    // Add status history
    statusHistory: [{
        status: 'lead' | 'proposal' | 'active' | 'completed' | 'maintenance';
        date: Date;
        updatedBy: mongoose.Types.ObjectId;
        notes?: string;
    }];

    communication: {
        preferredMethod: 'email' | 'phone' | 'other';
        preferredTime?: string;
        timezone: string;
        alternateContacts?: [{
            name: string;
            role: string;
            email: string;
            phone?: string;
        }];
    };
}

const clientSchema = new Schema({
    companyName: { type: String, required: true },
    contactName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    industry: { type: String, required: true },
    businessSize: { type: String, required: true },
    currentWebsite: { type: String },

    projectType: { 
        type: String, 
        enum: ['business', 'ecommerce', 'portfolio', 'blog', 'custom'],
        required: true 
    },
    projectScope: {
        estimatedPages: { type: Number, required: true },
        features: [{ type: String }],
        targetLaunchDate: { type: Date },
        budgetRange: {
            min: { type: Number },
            max: { type: Number }
        }
    },

    businessDetails: {
        description: { type: String, required: true },
        missionStatement: { type: String },
        targetAudience: { type: String, required: true },
        uniqueSellingPoints: [{ type: String }],
        competitors: [{ type: String }]
    },

    technicalRequirements: {
        domainStatus: { 
            type: String, 
            enum: ['needed', 'existing'],
            required: true 
        },
        domainName: { type: String },
        hostingPreference: { type: String },
        requiredIntegrations: [{ type: String }]
    },

    contentDetails: {
        contentProvider: { 
            type: String, 
            enum: ['client', 'codeweaver', 'mixed'],
            required: true 
        },
        mediaNeeds: {
            stockPhotos: { type: Boolean, default: false },
            customPhotography: { type: Boolean, default: false },
            videoContent: { type: Boolean, default: false }
        },
        seoRequirements: [{ type: String }]
    },

    status: { 
        type: String, 
        enum: ['lead', 'proposal', 'active', 'completed', 'maintenance'],
        default: 'lead' 
    },
    assignedPackage: { 
        type: String, 
        enum: ['basic', 'professional', 'ecommerce', 'enterprise']
    },
    projectValue: { type: Number },

    notes: [{
        content: { type: String, required: true },
        date: { type: Date, default: Date.now },
        author: { type: mongoose.Types.ObjectId, ref: 'User' }
    }],

    // Add these to the IClient interface
    assignedTo: { type: mongoose.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Types.ObjectId, ref: 'User' },
    lastUpdatedBy: { type: mongoose.Types.ObjectId, ref: 'User' },

    projectTimeline: {
        proposalSent: { type: Date },
        proposalAccepted: { type: Date },
        projectStarted: { type: Date },
        projectCompleted: { type: Date },
        maintenanceStarted: { type: Date }
    },

    statusHistory: [{
        status: { 
            type: String, 
            enum: ['lead', 'proposal', 'active', 'completed', 'maintenance'],
            required: true 
        },
        date: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
        notes: { type: String }
    }],

    communication: {
        preferredMethod: { 
            type: String, 
            enum: ['email', 'phone', 'other'],
            required: true 
        },
        preferredTime: { type: String },
        timezone: { type: String, required: true },
        alternateContacts: [{
            name: { type: String, required: true },
            role: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String }
        }]
    }
}, {
    timestamps: true
});

export const Client = mongoose.model<IClient>('Client', clientSchema); 