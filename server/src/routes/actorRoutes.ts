import { Router } from 'express';
import * as actorController from '../controllers/actorController';

const router = Router();

router.get('/', actorController.getAllActors);
router.get('/:id', actorController.getActorById);
router.get('/:id/actions', actorController.getActorActions);
router.post('/', actorController.createActor);
router.put('/:id', actorController.updateActor);
router.delete('/:id', actorController.deleteActor);

export default router;