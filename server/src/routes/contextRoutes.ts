import { Router } from 'express';
import * as contextController from '../controllers/contextController';

const router = Router();

router.get('/', contextController.getAllContexts);
router.get('/:id', contextController.getContextById);
router.post('/', contextController.createContext);
router.put('/:id', contextController.updateContext);
router.delete('/:id', contextController.deleteContext);

router.get('/:id/maps', contextController.getContextMaps);
router.post('/:id/maps', contextController.addMapToContext);
router.delete('/:id/maps/:mapId', contextController.removeMapFromContext);

export default router;
