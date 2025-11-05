import {DataSource} from "typeorm";
import bcryptjs from "bcryptjs";
import {faker} from "@faker-js/faker";
import {Product} from "../entity/product.entity.ts";

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
        const productRepository = AppDataSource.getRepository(Product);

        for (let i = 0; i < 30; i++) {
            await productRepository.save({
                title: faker.commerce.productName(),
                description: faker.commerce.productDescription(),
                image: faker.image.url({width: 200, height: 200}),
                price: parseFloat(faker.commerce.price()),
            });
        }

        process.exit(0);
    });