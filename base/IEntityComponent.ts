import {BasicSceneEntity} from "./BasicSceneEntity";

export interface IEntityComponent {
    setOwner(value: BasicSceneEntity): void ;
    getOwner(): BasicSceneEntity ;
}
