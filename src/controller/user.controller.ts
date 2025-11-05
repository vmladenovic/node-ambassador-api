import {Request, Response} from "express";
import {AppDataSource, client} from "../index.ts";
import {User} from "../entity/user.entity.ts";

export async function Ambassadors(req: Request, res: Response) {
    res.send(await AppDataSource.getRepository(User).find({where: {is_ambassador: true}}))
}

export async function Rankings(req: Request, res: Response) {
    // using Redis soring sets ZREVRANGEBYSCORE so that Redis will sort it for us. Data added in command <<npm run update:range>>. See src/seeder/rankings.ts
    // sending Redis native command docs. https://redis.io/docs/latest/commands/zrevrangebyscore/
    // const results = await client.sendCommand(['ZREVRANGEBYSCORE', 'rankings', '+inf', '-inf', 'WITHSCORES']); <-deprecated
    const results: string[] = await client.sendCommand(['ZRANGE', 'rankings', '+inf', '-inf', 'BYSCORE', 'REV', 'WITHSCORES']);
    let name;
    res.send(results.reduce((o, r) => {
        if (isNaN(parseInt(r))) {
            // if its not a number, then its a name
            name = r; // save it temporary
            return o;
        } else {
            // r is a value
            return {...o, [name]: parseInt(r)};
        }
    }, {}));
}