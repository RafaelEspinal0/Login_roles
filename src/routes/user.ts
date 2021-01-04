import { UserController } from './../controller/UserController';
import { Router } from 'express';
import {checkJwt} from './../middleware/jwt'
import {checkRole} from './../middleware/role';

const router = Router();

//obtener todos los usuarios
router.get('/', [checkJwt], UserController.getAll);

//Obtener un usuario
router.get('/:id', [checkJwt], UserController.getById);

//Crear un nuevo usuario
router.post('/', [checkJwt, checkRole(['admin'])], UserController.newUser);

//Editar usuario
router.patch('/:id', [checkJwt, checkRole(['admin'])], UserController.editUser);

//Eliminar un usuario
router.delete('/:id', [checkJwt, checkRole(['admin'])], UserController.deleteUser);

export default router;