import { getRepository } from "typeorm";
import { Request, Response } from "express";
import { User } from "../entity/User";
import  { validate } from "class-validator";

export class UserController {

    static getAll = async (req: Request, res:Response)=>{
        const userRespository = getRepository(User);
        let users;
        try {
            const users = await userRespository.find();
        } catch (e) {
            res.status(404).json({message: 'Algo salio mal !'});
        }

        
        if (users.length>0){
            res.send(users);
        }else{
            res.status(404).json({message: 'No hay resultados'});
        }
    }

    static getById = async(req:Request, res:Response) =>{
        const { id } = req.params;
        const userRespository = getRepository(User);
        try{
            const user = await userRespository.findOneOrFail(id);
            res.send(user);
        }catch(e){
            res.status(404).json({message: 'No hay resultados'})
        }
    }

    static newUser = async(req:Request, res:Response) =>{
        const {username, password, role} = req.body;
        const user = new User();

        user.username = username;
        user.password = password;
        user.role = role;

        //validar 
        const validationOpt = { validationError: { target:false, value:false } }
        const errors = await validate(user, validationOpt);
        if(errors.length > 0){
            return res.status(400).json(errors);
        }
                
        //TODO: HASH PASSWORD
        

        const userRespository = getRepository(User);
        try{
            user.hashPassword();
            await userRespository.save(user);
        }catch(e){
            return res.status(409).json({message: 'Este usuario ya existe'})
        }

        //Todo bien
        res.send('Usuario creado correctamente !')

    }

    static editUser = async(req:Request, res:Response)=>{
        let user;
        const {id} = req.params;
        const {username, role} = req.body;

        const userRespository = getRepository(User);
        try {
            user = await userRespository.findOneOrFail(id);
            user.username = username
            user.role = role;
        } catch (e) {
            return res.status(404).json({message: 'Usuario no encontrado'});
        }
        const validationOpt = { validationError: { target:false, value:false } }
        const errors = await validate(user, validationOpt);
        if(errors.length > 0){
            return res.status(400).json(errors);
        }

        //Try de guardar cambios al usuario
        try {
            user.hashPassword();
            await userRespository.save(user);
        } catch (e) {
            res.status(409).json({message:'El nombre de usuario esta en uso'})
        }
        res.status(201).json({message: 'Cambios al usuario realizados !'});
    }

    static deleteUser = async(req:Request, res:Response)=>{
        const { id } = req.params;
        const userRespository = getRepository(User);
        let user: User;

        try {
            user = await userRespository.findOneOrFail(id);
        } catch (e) {
            res.status(404).json({message: 'Usuario no encontrado '})
        }

        userRespository.delete(id);
        res.status(201).json({message: 'Usuario eliminado'})
        

    }


}

export default UserController;