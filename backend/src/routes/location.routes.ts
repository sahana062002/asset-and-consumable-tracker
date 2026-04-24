import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { createLocationSchema, updateLocationSchema } from '../validators/location.validator';
import { locationService } from '../services/location.service';

const router = Router();

router.use(authenticateToken);

router.get('/', async (req, res, next) => {
  try {
    const tree = await locationService.getTree();
    res.json({ success: true, data: tree });
  } catch (err) {
    next(err);
  }
});

router.get('/flat', async (req, res, next) => {
  try {
    const flat = await locationService.getFlat();
    res.json({ success: true, data: flat });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const single = await locationService.getSingle(Number(req.params.id));
    res.json({ success: true, data: single });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireRole('admin'), validate(createLocationSchema), async (req, res, next) => {
  try {
    const result = await locationService.create(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireRole('admin'), validate(updateLocationSchema), async (req, res, next) => {
  try {
    const result = await locationService.update(Number(req.params.id), req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireRole('admin'), async (req, res, next) => {
  try {
    const result = await locationService.delete(Number(req.params.id));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
