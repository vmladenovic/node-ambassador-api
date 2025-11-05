import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar")
    title: string;

    @Column("varchar")
    description: string;

    @Column("varchar")
    image: string;

    @Column("decimal")
    price: number;
}