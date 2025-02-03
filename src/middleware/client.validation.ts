import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Base client validation schema
const clientSchema = Joi.object({
    companyName: Joi.string().required(),
    contactName: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    industry: Joi.string().required(),
    businessSize: Joi.string().required(),
    currentWebsite: Joi.string().uri().allow(''),

    projectType: Joi.string().valid('business', 'ecommerce', 'portfolio', 'blog', 'custom').required(),
    projectScope: Joi.object({
        estimatedPages: Joi.number().required(),
        features: Joi.array().items(Joi.string()),
        targetLaunchDate: Joi.date(),
        budgetRange: Joi.object({
            min: Joi.number(),
            max: Joi.number()
        })
    }).required(),

    businessDetails: Joi.object({
        description: Joi.string().required(),
        missionStatement: Joi.string(),
        targetAudience: Joi.string().required(),
        uniqueSellingPoints: Joi.array().items(Joi.string()),
        competitors: Joi.array().items(Joi.string())
    }).required(),

    technicalRequirements: Joi.object({
        domainStatus: Joi.string().valid('needed', 'existing').required(),
        domainName: Joi.string(),
        hostingPreference: Joi.string(),
        requiredIntegrations: Joi.array().items(Joi.string())
    }).required(),

    contentDetails: Joi.object({
        contentProvider: Joi.string().valid('client', 'codeweaver', 'mixed').required(),
        mediaNeeds: Joi.object({
            stockPhotos: Joi.boolean(),
            customPhotography: Joi.boolean(),
            videoContent: Joi.boolean()
        }),
        seoRequirements: Joi.array().items(Joi.string())
    }).required()
});

// Note validation schema
const noteSchema = Joi.object({
    content: Joi.string().required(),
    author: Joi.string().required()
});

// Status validation schema
const statusSchema = Joi.object({
    status: Joi.string().valid('lead', 'proposal', 'active', 'completed', 'maintenance').required()
});

export const validateClient = async (
    req: Request,
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const { error } = clientSchema.validate(req.body);
        if (error) {
            res.status(400).json({
                message: 'Validation error',
                error: error.details[0].message
            });
            return;
        }
        next();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const validateNote = async (
    req: Request,
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const { error } = noteSchema.validate(req.body);
        if (error) {
            res.status(400).json({
                message: 'Validation error',
                error: error.details[0].message
            });
            return;
        }
        next();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const validateStatus = async (
    req: Request,
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const { error } = statusSchema.validate(req.body);
        if (error) {
            res.status(400).json({
                message: 'Validation error',
                error: error.details[0].message
            });
            return;
        }
        next();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}; 