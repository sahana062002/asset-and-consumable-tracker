import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { listAssetsSchema, createAssetSchema, updateLocationSchema, updateUsageSchema } from '../validators/asset.validator';
import { assetService } from '../services/asset.service';
import { uploadImage } from '../lib/upload';

const router = Router();
router.use(authenticateToken);

// Admin Routes
router.get('/', requireRole('admin'), async (req, res, next) => {
  try {
    const query = Object.keys(req.query).length ? req.query : {};
    const parsedQuery = await listAssetsSchema.parseAsync(query);
    const result = await assetService.list(parsedQuery);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// Any user can scan -> place before /:id param grabber
router.get('/scan/:assetCode', async (req, res, next) => {
  try {
    const asset = await assetService.scanLookup(req.params.assetCode);
    res.json({ success: true, data: asset });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireRole('admin'), async (req, res, next) => {
  try {
    const result = await assetService.getDetail(Number(req.params.id));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireRole('admin'), validate(createAssetSchema), async (req, res, next) => {
  try {
    const result = await assetService.create(req.body, req.user!.userId);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireRole('admin'), async (req, res, next) => {
  try {
    const result = await assetService.delete(Number(req.params.id));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// User + Admin Routes
router.put('/:id/location', validate(updateLocationSchema), async (req, res, next) => {
  try {
    const result = await assetService.updateLocation(Number(req.params.id), req.body, req.user!.userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/usage', validate(updateUsageSchema), async (req, res, next) => {
  try {
    const result = await assetService.updateUsage(Number(req.params.id), req.body, req.user!.userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/dispose', uploadImage.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw Object.assign(new Error('Photo is required'), { statusCode: 400 });
    }
    const photoUrl = `/uploads/disposals/${req.file.filename}`;
    const result = await assetService.dispose(Number(req.params.id), photoUrl, req.user!.userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
