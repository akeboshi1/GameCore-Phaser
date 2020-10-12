import { IRoomService } from "../../room";
import { IPos } from "../../../../utils/logic.pos";
import { op_client } from "pixelpai_proto";
import { IFramesModel } from "../../displayManager/frame/iframe.model";
import { ISprite } from "../../displayManager/sprite/sprite";
export interface IElement {
    readonly id: number;
    readonly dir: number;
    readonly roomService: IRoomService;

    model: ISprite;

    update();

    setModel(model: ISprite);

    updateModel(model: op_client.ISprite);

    play(animationName: string): void;

    setPosition(p: IPos): void;

    getPosition(): IPos;

    getPosition45(): IPos;

    setDirection(val: number): void;

    getDirection(): number;

    showEffected(displayInfo: IFramesModel);

    showNickname();

    hideNickname();

    // scaleTween();

    turn();

    setAlpha(val: number);

    setQueue(queue: op_client.IChangeAnimation[]);

    mount(ele: IElement): this;

    unmount(): this;

    addMount(ele: IElement, index?: number): this;

    removeMount(ele: IElement): this;
}
