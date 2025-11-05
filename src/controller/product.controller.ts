import {Request, Response} from "express";
import {AppDataSource, client} from "../index.ts";
import {Product} from "../entity/product.entity.ts";

export async function Products(req: Request, res: Response)   {
    res.send(await AppDataSource.getRepository(Product).find());
}

export async function CreateProduct(req: Request, res: Response) {
    res.send(await AppDataSource.getRepository(Product).save(req.body));
}

export async function GetProduct(req: Request, res: Response) {
    res.send(await AppDataSource.getRepository('Product').findOneBy({id: req.params.id}));
}

export async function UpdateProduct(req: Request, res: Response) {
    const productRepository = AppDataSource.getRepository(Product);

    await productRepository.update(req.params.id, req.body);

    res.send(await productRepository.findOne({where: {id: +req.params.id}}));
}

export async function DeleteProduct(req: Request, res: Response) {
    await AppDataSource.getRepository(Product).delete(req.params.id)
    res.status(204).send(null);
}

export async function ProductsFrontend(req: Request, res: Response) {
    let products = JSON.parse(String(await client.get('products_frontend')));

    if(!products) {
        products = await AppDataSource.getRepository(Product).find();
        await client.set('products_frontend', JSON.stringify(products), {EX: 60 * 30}); // 30 mins
    }
    res.send(products);
}

export async function ProductsBackend(req: Request, res: Response) {
    let products: Product[] = JSON.parse(String(await client.get('products_frontend')));

    if(!products) {
        products = await AppDataSource.getRepository(Product).find();
        await client.set('products_frontend', JSON.stringify(products), {EX: 60 * 30}); // 30 mins
    }

    if (req.query.s) {
        const s = req.query.s.toString().toLowerCase();

        products = products.filter(
            (p) => p.title.indexOf(String(s)) >= 0 || p.description.toLowerCase().indexOf(String(s)) >= 0)
    }

    if (req.query.sort === 'asc' || req.query.sort === 'desc') {
        products.sort((a, b) => req.query.sort === 'asc' ? a.price - b.price : b.price-a.price);
    }

    const page: number = parseInt(String(req.query.page) ?? '1');
    const perPage = 9;
    const total = products.length;

    const data = products.slice((page - 1) * perPage, page * perPage);

    res.send({
        data,
        total,
        page,
        last_page: Math.ceil(total / perPage)
    });
}