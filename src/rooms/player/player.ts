import { Element } from "../element/element";
import { IElementManager } from "../element/element.manager";
import { DragonbonesDisplay } from "../display/dragonbones.display";
import { op_client, op_virtual_world, op_def } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";

export enum PlayerState {
    IDLE = "idle",
    WALK = "walk",
    RUN = "run",
    ATTACK = "attack",
    JUMP = "jump",
    INJURED = "injured",
    FAILED = "failed",
    DANCE01 = "dance01",
    DANCE02 = "dance02",
    FISHING = "fishing",
    GREET01 = "greet01",
    SIT = "sit",
    LIE = "lit",
    EMOTION01 = "emotion01",
}

export class Player extends Element {
    protected mCurState: string;

    constructor(objectPosition: op_client.IObjectPosition, nodeType: number, protected mElementManager: IElementManager) {
        super(objectPosition, nodeType, mElementManager);
    }

    public move(moveData: op_client.IMoveData) {
        if (this.mCurState !== "walk") {
            this.changeState("walk");
        }
        super.move(moveData);
    }

    public changeState(val: string) {
        if (this.mCheckStateHandle(val)) {
            this.mCurState = val;
            (this.mDisplay as DragonbonesDisplay).play(val);
        }
    }

    public stopMove() {
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_STOP_OBJECT);
        const ct: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_STOP_OBJECT = pkt.content;
        ct.nodeType = op_def.NodeType.CharacterNodeType;
        ct.objectPositions = {
            id: this.id,
            point3f: {
                x: this.x | 0,
                y: this.y | 0,
                z: this.z | 0,
            }
        };
        this.mElementManager.connection.send(pkt);
        this.changeState("idle");
        super.stopMove();
    }

    public removeDisplay() {
        super.removeDisplay();
    }

    private mCheckStateHandle(val: string): boolean {
        if (this.mCurState === val) return false;
        this.mCurState = val;
        return true;
    }

    get x(): number {
        return this.mDisplay.x;
    }

    get y(): number {
        return this.mDisplay.y;
    }

    get z(): number {
        return this.mDisplay.z;
    }

    private dragonBonesFrameComplete(e: Event) {
        // todo  state change
        // this.mElementManager.connection.send()
        // 动作完成后发送协议给服务器告诉后端角色动作已经完成了，需要改变状态了
        this.changeState(PlayerState.IDLE);
    }
}
