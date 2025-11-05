import {Request, Response} from "express";
import {AppDataSource, client} from "../index.ts";
import {Order} from "../entity/order.entity.ts";
import {OrderItem} from "../entity/order_item.entity.ts";
import {Product} from "../entity/product.entity.ts";
import Stripe from "stripe";
import {User} from "../entity/user.entity.ts";
import {createTransport} from "nodemailer";

export async function Orders(req: Request, res: Response) {
    const orders = await AppDataSource.getRepository('Order').find({
        where: {
            complete: true,
        },
        relations: ['order_items']
    });

    res.send(orders.map((order: Order)=> ({
        id: order.id,
        name: order.name,
        email: order.email,
        total: order.total,
        created_at: order.created_at,
        order_items: order.order_items
    })));
}

export async function CreateOrder(req: Request, res: Response) {

    const body = req.body;
    const link = await AppDataSource.getRepository('Link').findOne({
        where: {
            code: body.code
        },
        relations: ['user']
    });

    if (!link) {
        return res.status(400).send({message: "Invalid link"});
    }

    // using transaction
    const queryRunner = AppDataSource.createQueryRunner();

    try {
        await queryRunner.connect();
        await queryRunner.startTransaction();

        let order = new Order();
        order.ambassador_email = link.user.email;
        order.user_id = link.user.id;
        order.code = body.code;
        order.first_name = body.first_name;
        order.last_name = body.last_name;
        order.email = body.email;
        order.address = body.address;
        order.country = body.country;
        order.city = body.city;
        order.zip = body.zip;

        order = await queryRunner.manager.save(order);

        const line_items = [];

        for (let p of body.products) {
            const product = await AppDataSource.getRepository(Product).findOne({where: {id: p.product_id}});
            const orderItem = new OrderItem();
            orderItem.order = order;
            orderItem.product_title = product.title;
            orderItem.price = product.price;
            orderItem.quantity = p.quantity;
            orderItem.ambassador_revenue = product.price * p.quantity * 0.1; // 10% goes to the ambasador
            orderItem.admin_revenue = product.price * p.quantity * 0.9; // 90% goes to the ambasador

            await queryRunner.manager.save(orderItem);

            line_items.push({
                price_data: {
                    currency: 'eur',
                    unit_amount: product.price * 100,
                    product_data: {
                        name: product.title,
                        description: product.description,
                        images: [product.image],
                    }
                },
                quantity: p.quantity
            });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET);
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${process.env.CHECKOUT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: process.env.CHECKOUT_URL,
        })

        await queryRunner.commitTransaction();
        order.transaction_id = session.id; // add stripe transaction id
        await queryRunner.manager.save(order);

        res.send(session);
    } catch (error) {
        console.error(error);
        await queryRunner.rollbackTransaction();
        res.status(400).send({message: "Error creating order"});
    }
}

export async function ConfirmOrder(req: Request, res: Response) {
    const OrderRepository = AppDataSource.getRepository(Order);
    const order = await OrderRepository.findOne({
        where: {
            transaction_id: req.body.session
        },
        relations: ['order_items']
    });

    if (!order) {
        return res.status(404).send({message: "Order not found"});
    }

    await OrderRepository.update(order.id, {complete: true});

    const user = await AppDataSource.getRepository(User).findOne({where: {id: order.user_id}});
    await client.zIncrBy('revenue', order.ambassador_revenue, user.name); // redis command to synchronize revenue

    // sand email, test with Mailpit. run npm run mailpit -> open http://localhost:8025 for web mail client
    const transporter = createTransport({
        host: process.env.MAILPIT_URL  ?? 'localhost',
        port: process.env.MAILPIT_PORT,
    });

    // send mail to the admin and ambassador
    await transporter.sendMail({
        to: 'admin@admin.com',
        subject: 'New order',
        html: `Order #${order.id} with a total of ${order.total}  has been completed`,
    });
    await transporter.sendMail({
        to: order.ambassador_email,
        subject: 'New order',
        html: `You earned  $${order.ambassador_revenue}  from the link #${order.code}`,
    });

    await transporter.close();

    return res.send({message: "Success"});
}