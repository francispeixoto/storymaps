import { Router } from 'express';
import * as activityController from '../controllers/activityController';

const router = Router();

router.get('/', activityController.getAllActivities);
router.get('/:id', activityController.getActivityById);
router.post('/', activityController.createActivity);
router.put('/:id', activityController.updateActivity);
router.delete('/:id', activityController.deleteActivity);

export default router;