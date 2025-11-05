import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {OrderItem} from "./order_item.entity.ts";
import {Link} from "./link.entity.ts";

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", nullable: true})
    transaction_id: string;

    @Column("int")
    user_id: number;

    @Column("varchar")
    code: string;

    // replicating columns as if a user is deleted we will lose reference to the ambassador
    // for Order tables it is a suggested way to handle this
    @Column("varchar")
    ambassador_email: string;

    @Column("varchar")
    first_name: string;

    @Column("varchar")
    last_name: string;

    @Column("varchar")
    email: string

    @Column({type: "varchar", nullable: true})
    address: string;

    @Column({type: "varchar", nullable: true})
    country: string;

    @Column({type: "varchar", nullable: true})
    city: string;

    @Column({type: "varchar", nullable: true})
    zip: string;

    @Column("boolean", {default: false})
    complete: boolean;

    @CreateDateColumn()
    created_at: string;

    @OneToMany(() => OrderItem, orderItem => orderItem.order)
    order_items: OrderItem[];

    @ManyToOne(() => Link, link => link.orders, {
        createForeignKeyConstraints: false,
    })
    @JoinColumn({name: 'code', referencedColumnName: 'code'}) // ne kreiramo foreign key vec koristimo postojecu kolonu code kao vezu za link
    link: Link;

    get name() : string {
        return `${this.first_name} ${this.last_name}`
    }

    get total(): number {
        return this.order_items.reduce((sum, item) => sum + item.admin_revenue, 0);
    }

    get ambassador_revenue(): number {
        return this.order_items.reduce((sum, item) => sum + item.ambassador_revenue, 0);
    }
}