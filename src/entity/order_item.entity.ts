import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Order} from "./order.entity.ts";

@Entity()
export class OrderItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar")
    product_title: string;

    @Column("int")
    price: number;

    @Column("int")
    quantity: number;

    @Column("int")
    ambassador_revenue: number;

    @Column("int")
    admin_revenue: number;

    @ManyToOne(() => Order, order => order.order_items)
    @JoinColumn({ name: "order_id"})
    order: Order
}