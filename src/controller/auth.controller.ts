import { Request, Response } from "express";
import {User} from "../entity/user.entity.ts";
import {AppDataSource} from "../index.ts";
import bcryptjs from "bcryptjs";
import {sign, verify} from "jsonwebtoken";
import {Order} from "../entity/order.entity.ts";

export const Register = async(req: Request, res:Response) => {
    const {password, password_confirm, ...body} = req.body;

    if (password !== password_confirm) {
        return res.status(400).send({message: "Passwords do not match"});
    }

    const UserRepository =  AppDataSource.getRepository(User);

    const user = await UserRepository.save({
        ...body,
        password: await bcryptjs.hash(password, 10),
        is_ambassador: req.path === '/api/ambassador/register'
    });

    delete user.password;

    res.status(201).send(user);
}

export async function Login(req: Request, res: Response) {
    const user = await AppDataSource.getRepository(User).findOne({
        where: {
            email: req.body.email
        },
        select: ['id', 'password', 'is_ambassador']
    });

    if (!user) {
        return res.status(400).send({message: "Invalid credentials"});
    }

    if (!await bcryptjs.compare(req.body.password, user.password)) {
        return res.status(400).send({message: "Invalid credentials"});
    }

    const adminLogin = req.path === '/api/admin/login';

    if (user.is_ambassador && adminLogin) {
        return res.status(401).send({message: "Unauthorized"});
    }

    const token = sign({
        id: user.id,
        scope: adminLogin ? 'admin' : 'ambassador',
    }, process.env.JWT_SECRET_KEY)
    res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    return res.send({message: "Login successful"});
}

export async function AuthenticatedUser(req: Request, res: Response, next: Function) {
    // all done in auth.middleware.ts middleware
    const user = req['user'];
    if (req.path === '/api/admin/user') {
        return res.send(user);
    }

    const orders = await AppDataSource.getRepository(Order).find({
        where: {
            user_id: user.id,
            complete: true,
        },
        relations: ['order_items']
    });

    // total for every order
    user.revenue = orders.reduce((total, order) => total + order.ambassador_revenue, 0);

    res.send(user);

}
export function Logout(req: Request, res: Response) {
    res.clearCookie("jwt");
    res.send({message: "Logout successful"});
}

export async function UpdateInfo(req: Request, res: Response) {
    const user = req['user'];

    const UserRepository =  AppDataSource.getRepository(User);
    await UserRepository.update(user.id, req.body);

    res.send(await UserRepository.findOneBy({id: user.id}));
}

export async function UpdatePassword(req: Request, res: Response) {
    const user = req['user'];

    if (req.body.password !== req.body.password_confirm) {
        return res.status(400).send({message: "Passwords do not match"});
    }

    await AppDataSource.getRepository(User).update(user.id, {password: await bcryptjs.hash(req.body.password, 10)});

    res.send(user);
}