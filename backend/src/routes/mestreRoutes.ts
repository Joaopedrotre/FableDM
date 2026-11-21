import { Router } from 'express';
import { MestreController } from '../controllers/MestreController.js';
import { autenticar } from '../middlewares/autenticar.js';

const router = Router();
const controller = new MestreController();

router.post('/mensagem', autenticar, controller.responder);

export default router;
