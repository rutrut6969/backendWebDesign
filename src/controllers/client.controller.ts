import { Response } from 'express';
import { Client } from '../models/Client';
import { AuthenticatedRequest } from '../types/custom';

export class ClientController {
    // Create new client
    async createClient(req: AuthenticatedRequest, res: Response) {
        try {
            const clientData = req.body;
            const client = new Client(clientData);
            await client.save();

            res.status(201).json({
                message: 'Client created successfully',
                client
            });
        } catch (error: any) {
            res.status(400).json({
                message: 'Failed to create client',
                error: error.message
            });
        }
    }

    // Get all clients
    async getClients(req: AuthenticatedRequest, res: Response) {
        try {
            const clients = await Client.find()
                .sort({ createdAt: -1 });

            res.status(200).json({
                message: 'Clients retrieved successfully',
                clients
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Failed to retrieve clients',
                error: error.message
            });
        }
    }

    // Get single client
    async getClient(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const client = await Client.findById(id);

            if (!client) {
                return res.status(404).json({
                    message: 'Client not found'
                });
            }

            res.status(200).json({
                message: 'Client retrieved successfully',
                client
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'Failed to retrieve client',
                error: error.message
            });
        }
    }

    // Update client
    async updateClient(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const client = await Client.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );

            if (!client) {
                return res.status(404).json({
                    message: 'Client not found'
                });
            }

            res.status(200).json({
                message: 'Client updated successfully',
                client
            });
        } catch (error: any) {
            res.status(400).json({
                message: 'Failed to update client',
                error: error.message
            });
        }
    }

    // Add note to client
    async addNote(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const { content, author } = req.body;

            const client = await Client.findByIdAndUpdate(
                id,
                {
                    $push: {
                        notes: {
                            content,
                            author,
                            date: new Date()
                        }
                    }
                },
                { new: true }
            );

            if (!client) {
                return res.status(404).json({
                    message: 'Client not found'
                });
            }

            res.status(200).json({
                message: 'Note added successfully',
                client
            });
        } catch (error: any) {
            res.status(400).json({
                message: 'Failed to add note',
                error: error.message
            });
        }
    }

    // Update client status
    async updateStatus(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const client = await Client.findByIdAndUpdate(
                id,
                { status },
                { new: true }
            );

            if (!client) {
                return res.status(404).json({
                    message: 'Client not found'
                });
            }

            res.status(200).json({
                message: 'Client status updated successfully',
                client
            });
        } catch (error: any) {
            res.status(400).json({
                message: 'Failed to update client status',
                error: error.message
            });
        }
    }
}

export default new ClientController(); 