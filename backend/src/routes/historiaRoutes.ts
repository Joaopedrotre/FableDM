import { Router } from 'express';
import { HistoriaController } from '../controllers/HistoriaController.js';
import { autenticar } from '../middlewares/autenticar.js';

const router = Router();
const historias = new HistoriaController();

router.use(autenticar);

router.get('/', historias.listar);
router.post('/', historias.criar);
router.get('/:id', historias.buscar);
router.put('/:id', historias.editar);
router.delete('/:id', historias.excluir);

router.get('/:id/sessao', historias.sessao);
router.get('/:id/mensagens', historias.mensagensAnteriores);
router.post('/:id/mensagens', historias.enviarAcao);

export default router;
