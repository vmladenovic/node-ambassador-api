import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("varchar")
    first_name!: string;

    @Column("varchar")
    last_name!: string;

    @Column({
        type: "varchar",
        unique: true
    })
    email: string;

    @Column({type: "varchar", select: false})
    password: string;

    @Column('boolean')
    is_ambassador: boolean;

    get name(): string {
        return `${this.first_name} ${this.last_name}`
    }
}
