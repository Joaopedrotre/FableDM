import { Router } from 'express';
import { AutenticacaoController } from '../controllers/AutenticacaoController.js';

const router = Router();
const controller = new AutenticacaoController();

router.post('/', controller.entrar);
router.post('/teste', controller.entrarComoTeste);

export default router;
