import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController.js';
import { autenticar } from '../middlewares/autenticar.js';

const router = Router();
const controller = new UsuarioController();

router.post('/', controller.cadastrar);
router.put('/me', autenticar, controller.editar);

export default router;
