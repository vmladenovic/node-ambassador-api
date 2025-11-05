import {Request, Response} from "express";
import {verify} from "jsonwebtoken";
import {AppDataSource} from "../index.ts";
import {User} from "../entity/user.entity.ts";

export async function AuthMiddleware(req: Request, res: Response, next: Function) {
    try {
        const token = req.cookies.jwt;

        const payload = verify(token, process.env.JWT_SECRET_KEY);
        if (!payload) {
            return res.status(401).send({message: "Unauthorized"});
        }

        const  is_ambassador = req.path.indexOf('api/ambassador') >= 0;
        const user = await AppDataSource.getRepository(User).findOneBy({id: payload['id']});

        if (is_ambassador && payload['scope'] !== 'ambassador' || (!is_ambassador && payload['scope'] !== 'admin')) {
            return res.status(401).send({message: "Unauthorized"});
        }

        req['user'] = user; // propagating user

        next();
    } catch (error) {
        return res.status(401).send({message: "Unauthorized"});
    }
}