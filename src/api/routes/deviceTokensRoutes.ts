import { Router } from 'express';
import { register, remove } from '../controllers/deviceTokensController.js';
import { requireRole, UserRole } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireRole(UserRole.USER));

/**
 * @swagger
 * components:
 *   schemas:
 *     DeviceToken:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         profile_id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         player_id:
 *           type: string
 *           example: "abc123def456"
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     RegisterDeviceTokenRequest:
 *       type: object
 *       required:
 *         - player_id
 *       properties:
 *         player_id:
 *           type: string
 *           minLength: 1
 *           example: "abc123def456"
 */

/**
 * @swagger
 * /device-tokens:
 *   post:
 *     summary: Register a device token for push notifications
 *     description: Registers a OneSignal player ID for the authenticated user. Upserts on conflict.
 *     tags:
 *       - Device Tokens
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterDeviceTokenRequest'
 *     responses:
 *       201:
 *         description: Device token registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       $ref: '#/components/schemas/DeviceToken'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', register);

/**
 * @swagger
 * /device-tokens/{playerId}:
 *   delete:
 *     summary: Remove a device token
 *     description: Removes a OneSignal player ID for the authenticated user.
 *     tags:
 *       - Device Tokens
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The OneSignal player ID to remove
 *     responses:
 *       204:
 *         description: Device token removed successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Device token not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:playerId', remove);

export default router;
