import { Router } from 'express';
import { getRoadmapItems } from '../controllers/roadmapController';

const router = Router();

router.get('/', getRoadmapItems);

export default router;