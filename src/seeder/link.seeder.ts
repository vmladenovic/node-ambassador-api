import {DataSource} from "typeorm";
import {faker} from "@faker-js/faker";
import {Link} from "../entity/link.entity.ts";
import {User} from "../entity/user.entity.ts";
import {randomInt} from "node:crypto";

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
        const linkRepository = AppDataSource.getRepository(Link);

        for (let i = 0; i < 30; i++) {
            const user = new User();
            user.id = i + 7; // first 6 users are corrupted, updated and some were deleted

            await linkRepository.save({
                code: faker.string.alpha(
                    {length: 6}
                ) as string,
                user,
                // image: faker.image.url({width: 200, height: 200}),
                products: [randomInt(1, 30)],
            });
        }

        process.exit(0);
    });