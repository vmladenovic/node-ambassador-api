import {DataSource} from "typeorm";
import bcryptjs from "bcryptjs";
import {faker} from "@faker-js/faker";

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
        const userRepository = AppDataSource.getRepository('User');
        const password = await bcryptjs.hash('AAAA1111a', 10);

        for (let i = 0; i < 30; i++) {
            await userRepository.save({
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                email: faker.internet.email(),
                password: password,
                is_ambassador: true,
            });
        }

        process.exit();
    });