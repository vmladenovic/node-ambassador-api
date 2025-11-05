import {DataSource} from "typeorm";
import {createClient} from "redis";
import {User} from "../entity/user.entity.ts";
import {Order} from "../entity/order.entity.ts";

const AppDataSource = new DataSource({
    "type": "mysql",
    "host": process.env.DB_HOST,
    "port": parseInt(process.env.DB_PORT ?? '3306'),
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "synchronize": true,
    "logging": false,
    "entities": ["src/entity/*.ts"]
});

AppDataSource
    .initialize()
    .then(async () => {
        const client = createClient({
            url: process.env.REDIS_URL,
        });

        await client.connect();

        const ambassadors = await AppDataSource.getRepository(User).find({
            where: {
                is_ambassador: true
            }
        });
        const OrderRepository = AppDataSource.getRepository(Order)

        for (let i = 0; i < ambassadors.length; i++) {
            const orders = await OrderRepository.find({
                where: {
                    user_id: ambassadors[i].id,
                    complete: true,
                },
                relations: ['order_items']
            });

            const revenue = orders.reduce((total, order) => total + order.ambassador_revenue, 0);
            // using Redis soring sets ZADD so that Redis will sort it for us
            await client.zAdd('rankings', {value: ambassadors[i].name, score: revenue});
        }

        process.exit(0);
    });