import { Router } from 'express';
import { MestreController } from '../controllers/MestreController.js';

const router = Router();
const controller = new MestreController();

router.post('/mensagem', controller.responder);

export default router;
