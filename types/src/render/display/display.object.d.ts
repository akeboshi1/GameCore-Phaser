import { IBaseDisplay } from "../../base/render/display";
import { IPos, IProjection } from "utils";
import { ElementStateType } from "structure";
export interface IDisplayObject extends IBaseDisplay {
    id: number;
    titleMask: number;
    projectionSize: IProjection;
    nodeType: number | undefined;
    startLoad(): Promise<any>;
    checkCollision(sprite: any): boolean;
    showRefernceArea(area: number[][], origin: IPos): any;
    hideRefernceArea(): any;
    updateTopDisplay(): any;
    showNickname(name?: string): any;
    showTopDisplay(data?: ElementStateType): any;
    showBubble(text: string, setting: any): any;
    clearBubble(): any;
    doMove(moveData: any): any;
    startFireMove(pos: any): any;
    mount(ele: Phaser.GameObjects.Container, targetIndex?: number): any;
    unmount(ele: Phaser.GameObjects.Container): any;
    addEffect(display: IDisplayObject): any;
    removeEffect(display: IDisplayObject): any;
}
