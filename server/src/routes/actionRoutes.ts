import { Router } from 'express';
import * as actionController from '../controllers/actionController';

const router = Router();

router.get('/', actionController.getAllActions);
router.get('/:id', actionController.getActionById);
router.post('/', actionController.createAction);
router.put('/:id', actionController.updateAction);
router.delete('/:id', actionController.deleteAction);

router.get('/:id/dependencies', actionController.getActionDependencies);
router.post('/:id/dependencies', actionController.addActionDependency);
router.delete('/:id/dependencies/:dependsOnId', actionController.removeActionDependency);

export default router;