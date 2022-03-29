import {User} from "./user.dto";
import {Anime} from "./anime.dto";
import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class AnimeEntry extends BaseEntity {
    @PrimaryGeneratedColumn()
    declare id: number;

    @ManyToOne(type => User, user => user.animeList)
    declare user: User;

    @ManyToOne(type => Anime)
    declare anime: Anime;

    @Column()
    declare episodesWatched: number;

    @Column()
    declare status: "Watching" | "Plan to watch" | "Completed" | "Dropped" | "On hold";
}
