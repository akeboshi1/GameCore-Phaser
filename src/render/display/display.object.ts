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

    showRefernceArea(area: number[][], origin: IPos);

    hideRefernceArea();

    updateTopDisplay();

    showNickname(name?: string);

    showTopDisplay(data?: ElementStateType);

    showBubble(text: string, setting: any);

    clearBubble();

    doMove(moveData: any);

    startFireMove(pos);

    mount(ele: Phaser.GameObjects.Container, targetIndex?: number);

    unmount(ele: Phaser.GameObjects.Container);

    addEffect(display: IDisplayObject);

    removeEffect(display: IDisplayObject);
}
