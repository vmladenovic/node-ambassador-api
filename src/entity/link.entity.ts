import {Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user.entity.ts";
import {Product} from "./product.entity.ts";
import {Order} from "./order.entity.ts";

@Entity()
export class Link {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", unique: true})
    code: string;

    @ManyToOne(() => User)
    @JoinColumn({name: "user_id"})
    user: User;

    @ManyToMany(() => Product)
    @JoinTable({
        name: 'link_products',
        joinColumn: {name: 'link_id', referencedColumnName: 'id'},
        inverseJoinColumn: {name: 'product_id', referencedColumnName: 'id'}
    })
    products: Product[];

    @OneToMany(() => Order, order => order.link, {
        createForeignKeyConstraints: false, // we are not creating foreign key constraints for this table
    })
    @JoinColumn({name: 'code', referencedColumnName: 'code'})
    orders: Order[];
}