import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController.js';

const router = Router();
const controller = new UsuarioController();

router.post('/', controller.cadastrar);

export default router;
