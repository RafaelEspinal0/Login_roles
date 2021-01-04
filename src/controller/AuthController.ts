
import { User } from './../entity/User';
import { Request, Response } from 'express'
import { getRepository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import config from '../config/config'
import { validate } from 'class-validator';


class AuthController {

    static login = async (req: Request, res: Response)=>{
        const{username, password} = req.body;
        if(!(username && password)){
            return res.status(400).json({message: 'Usuario y contraseña son requeridos !'});
        }
        const userRepository = getRepository(User);
        let user: User;

        try{
            user = await userRepository.findOneOrFail({ where:{username}});
        }catch(e){
            return res.status(400).json({message: 'Usuario o contraseña incorrecta !'});
        }

        if(!user.checkPassword(password)){
            return res.status(400).json({message:'Usuario o contraseña incorrecta !'})
        }
        const token = jwt.sign({userId: user.id, username: user.username}, config.jwtSecret, {expiresIn:'1h'});
        res.json({message:'OK', token});
    };

    static changePassword = async(req:Request, res:Response)=>{
        const {userId} = res.locals.jwtPayload;
        const {oldPassword, newPassword} = req.body;

        if(!(oldPassword && newPassword)){
            res.status(400).json({message:'Vieja contraseña y nueva contraseña son requeridas'});
        }

        const userRepository= getRepository(User);
        let user: User;

        try {
            user = await userRepository.findOneOrFail(userId);
        } catch (e) {
            res.status(400).json({message: 'Algo salio mal !'});
        }

        if(!user.checkPassword(oldPassword)){
            return res.status(401).json({message: 'Revisa tu vieja contraseña'});        
        }
        user.password = newPassword;
        const validationOpt = {validationError:{target:false, value:false}};
        const errors = await validate(user, validationOpt);
    
        if(errors.length > 0){
            return res.status(400).json(errors);
        }

        //Hash password
        user.hashPassword();
        userRepository.save(user);

        res.json({message: 'La contraseña se ha cambiado !'})
    };
}

export default AuthController;