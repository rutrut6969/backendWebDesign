import express from 'express';
import { ClientController } from '../controllers/client.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { checkRole } from '../middleware/role.middleware';
import { validateClient, validateNote, validateStatus } from '../middleware/client.validation';
import { AuthenticatedRequest } from '../types/custom';
import { Response } from 'express';

const router = express.Router();
const clientController = new ClientController();

// Protected routes - require authentication
router.use(authenticateToken);

// Get all clients - admin only
router.get(
    '/',
    checkRole(['admin', 'owner']),
    (req: AuthenticatedRequest, res: Response) => {
        clientController.getClients(req, res);
    }
);

// Get single client
router.get(
    '/:id',
    checkRole(['admin', 'owner']),
    (req: AuthenticatedRequest, res: Response) => {
        clientController.getClient(req, res);
    }
);

// Create new client
router.post(
    '/',
    checkRole(['admin', 'owner']),
    validateClient,
    (req: AuthenticatedRequest, res: Response) => {
        clientController.createClient(req, res);
    }
);

// Update client
router.patch(
    '/:id',
    checkRole(['admin', 'owner']),
    validateClient,
    (req: AuthenticatedRequest, res: Response) => {
        clientController.updateClient(req, res);
    }
);

// Add note to client
router.post(
    '/:id/notes',
    checkRole(['admin', 'owner']),
    validateNote,
    (req: AuthenticatedRequest, res: Response) => {
        clientController.addNote(req, res);
    }
);

// Update client status
router.patch(
    '/:id/status',
    checkRole(['admin', 'owner']),
    validateStatus,
    (req: AuthenticatedRequest, res: Response) => {
        clientController.updateStatus(req, res);
    }
);

export default router; 