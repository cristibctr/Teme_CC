import {AnimeEntry} from "./anime-entry.dto";
import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    declare id: number;

    @Column()
    declare name: string;

    @OneToMany(type => AnimeEntry, entry => entry.user)
    declare animeList: Promise<AnimeEntry[]>;
}