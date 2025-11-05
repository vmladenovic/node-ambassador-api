import {DataSource} from "typeorm";
import {faker} from "@faker-js/faker";
import {Link} from "../entity/link.entity.ts";
import {User} from "../entity/user.entity.ts";
import {randomInt} from "node:crypto";
import {Order} from "../entity/order.entity.ts";
import {OrderItem} from "../entity/order_item.entity.ts";

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
        const orderRepository = AppDataSource.getRepository(Order);
        const orderItemRepository = AppDataSource.getRepository(OrderItem);

        for (let i = 0; i < 30; i++) {
            const order = await orderRepository.save({
                user_id: randomInt(2, 31),
                code: faker.string.alpha(6),
                ambassador_email: faker.internet.email(),
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                email: faker.internet.email(),
                complete: true,
            });

            for (let j = 0; j < randomInt(1, 5); j++) {
                await orderItemRepository.save({
                    order,
                    product_title: faker.commerce.productName(),
                    price: randomInt(10, 100),
                    quantity: randomInt(1, 5),
                    ambassador_revenue: randomInt(10, 100),
                    admin_revenue: randomInt(10, 100),
                });
            }

        }

        process.exit(0);
    });