import {BasicSceneEntity} from "./BasicSceneEntity";

export interface IEntityComponent {
    onTick(deltaTime: number): void;
    owner: BasicSceneEntity;
}
