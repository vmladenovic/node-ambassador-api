import {Request, Response} from "express";
import {AppDataSource} from "../index.ts";
import {Link} from "../entity/link.entity.ts";

export async function Links(req: Request, res: Response) {
    const links = await AppDataSource.getRepository(Link).find({
        where: {
            user: {
                id: parseInt(req.params.id)}
        },
        relations: ['orders', 'orders.order_items']
    });

    res.send(links);
}

export async function CreateLink(req: Request, res: Response) {
    const link = await AppDataSource.getRepository(Link).save({
        user: {id: parseInt(req['user'].id)},
        code: Math.random().toString(36).substring(6),
        products: req.body.products.map((id: string) => ({id: parseInt(id)})),
    });

    res.status(201).send(link);
}

export async function Stats(req: Request, res: Response) {
    const user = req['user'];
    const links = await AppDataSource.getRepository(Link).find({
        where: {
            user,
        },
        relations: ['orders', 'orders.order_items']
    });

    res.send(links.map((link: Link) => {
        const orders = link.orders.filter((order) => order.complete);
        return {
            code: link.code,
            count: orders.length,
            revenue: orders.reduce((total, order) => total + order.ambassador_revenue, 0),
        }
    }));
}

export async function GetLink(req: Request, res: Response) {
    res.send(
        await AppDataSource.getRepository(Link)
            .findOne({
                where: {
                    code: req.params.code
                },
                relations: ['user', 'products']
            }));
}