import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { createUserSchema, updateUserSchema, resetPasswordSchema, changePasswordSchema } from '../validators/user.validator';
import { userService } from '../services/user.service';

const router = Router();

// Authenticated users can change their own password
router.post('/change-password', authenticateToken, validate(changePasswordSchema), async (req, res, next) => {
  try {
    const result = await userService.changePassword(req.user!.userId, req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// Admin only for remaining routes
router.use(authenticateToken, requireRole('admin'));


router.get('/', async (req, res, next) => {
  try {
    const users = await userService.findAll();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(createUserSchema), async (req, res, next) => {
  try {
    const result = await userService.create(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validate(updateUserSchema), async (req, res, next) => {
  try {
    const result = await userService.update(Number(req.params.id), req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/reset-password', validate(resetPasswordSchema), async (req, res, next) => {
  try {
    const result = await userService.resetPassword(Number(req.params.id), req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await userService.softDelete(Number(req.params.id));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
