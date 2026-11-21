import { Router } from 'express';
import { ItemController } from '../controllers/ItemController.js';
import { PersonagemController } from '../controllers/PersonagemController.js';
import { autenticar } from '../middlewares/autenticar.js';

const router = Router();
const personagens = new PersonagemController();
const itens = new ItemController();

router.use(autenticar);

router.get('/', personagens.listar);
router.post('/', personagens.criar);
router.get('/:id', personagens.buscar);
router.put('/:id', personagens.editar);
router.delete('/:id', personagens.excluir);

router.get('/:id/itens', itens.listar);
router.post('/:id/itens', itens.criar);
router.get('/:id/itens/:itemId', itens.buscar);
router.put('/:id/itens/:itemId', itens.editar);
router.delete('/:id/itens/:itemId', itens.excluir);

export default router;
