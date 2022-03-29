import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {AnimeEntry} from "./anime-entry.dto";

@Entity()
export class Anime extends BaseEntity {
    @PrimaryGeneratedColumn()
    declare id: number;

    @Column()
    declare name: string;

    @OneToMany(type => AnimeEntry, entry => entry.anime)
    declare entries: Promise<AnimeEntry[]>;
}
