import { Router } from 'express';
import { CampanhaController } from '../controllers/CampanhaController.js';
import { autenticar } from '../middlewares/autenticar.js';

const router = Router();
const campanhas = new CampanhaController();

router.use(autenticar);

router.get('/', campanhas.listar);
router.post('/', campanhas.criar);
router.get('/:id', campanhas.buscar);
router.put('/:id', campanhas.editar);
router.delete('/:id', campanhas.excluir);

export default router;
