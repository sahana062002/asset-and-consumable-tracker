import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import { loginSchema } from '../validators/auth.validator';
import { authService } from '../services/auth.service';

const router = Router();

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', authenticateToken, (req, res) => {
  // Stateless JWT -> effectively immediately 'returns 200 success'. 
  res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user!.userId);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

export default router;
