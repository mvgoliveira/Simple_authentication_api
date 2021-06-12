import { Router } from "express";
import { SessionController } from "./controllers/SessionController";
import { UserController } from "./controllers/UserController";
import { Auth } from "./middlewares/Auth";

const router = Router();

const userController = new UserController();
const sessionController = new SessionController();
const auth = new Auth();

router.get('/users/:page', auth.admin, userController.list);
router.post('/users', userController.create);
router.put('/users', auth.user, userController.update);
router.delete('/users/:user_id', auth.admin, userController.delete);

router.post('/login', sessionController.create);

export { router }