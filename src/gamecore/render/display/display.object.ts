
import { ElementStateType, IPos, IProjection } from "structure";
import { IBaseDisplay } from "display";
export interface IDisplayObject extends IBaseDisplay {
    id: number;
    titleMask: number;
    projectionSize: IProjection;
    nodeType: number | undefined;

    startLoad(): Promise<any>;

    showRefernceArea(area: number[][], origin: IPos, conflictMap?: number[][], freeColor?: number, conflictColor?: number);

    hideRefernceArea();

    showGrids();

    hideGrids();

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
