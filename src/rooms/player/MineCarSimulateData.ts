import { op_client, op_def } from "pixelpai_proto";
import { Sprite, ISprite } from "../element/sprite";
import { ElementManager } from "../element/element.manager";
import { IRoomService, Room } from "../room";
import { GroupType } from "../group/GroupManager";
import { FollowAction } from "../action/FollowAction";
import { FollowGroup } from "../group/FollowGroup";
import { Pos } from "../../utils/pos";
export class MineCarSimulateData {

    public static destroyMineCar(eleMgr: ElementManager, sprite: ISprite) {
        const simData = this.getCarSprite(sprite);
        if (simData)
            eleMgr.remove(simData.sprites[0].id + sprite.id);
    }

    public static addSimulate(roomService: IRoomService, sprite: op_client.ISprite, oldSprite?: op_client.ISprite) {
        let oldCarPos: Pos;
        if (sprite.attrs.length < 1) {
            return;
        }
        if (oldSprite) {
            const newtype = this.getMineCarType(sprite.attrs);
            const oldtype = this.getMineCarType(oldSprite.attrs);
            if (newtype === oldtype) return;
            const simData = this.getCarSprite(oldSprite);
            if (simData) {
                const eleID = simData.sprites[0].id + sprite.id;
                const element = roomService.elementManager.get(eleID);
                if (element) {
                    oldCarPos = element.getPosition();
                    roomService.elementManager.remove(eleID);
                }
            }
        }

        const content = this.getCarSprite(sprite);
        if (!content) return;
        const msprite = content.sprites[0];
        msprite.id = msprite.id + sprite.id;
        let ele = roomService.elementManager.get(msprite.id);
        if (!ele) {
            roomService.elementManager.add([new Sprite(msprite)]);
            ele = roomService.elementManager.get(msprite.id);

        }
        const room = roomService as Room;
        const playMgr = room.playerManager;
        const owner = playMgr.get(sprite.id);
        ele.setPosition(oldCarPos ? oldCarPos : owner.getPosition());
        const groupMgr = room.groupManager;
        let group = groupMgr.getGroup(owner, GroupType.Follow);
        if (!group) group = room.groupManager.createGroup<FollowGroup>(owner, GroupType.Follow);
        group.addChild(ele);
        ele.ai.addAction(new FollowAction(group),true);
    }

    public static getCarSprite(sprite: op_client.ISprite) {

        const type = this.getMineCarType(sprite.attrs);
        if (!type) return null;
        let content: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE;
        if (type === "EQUIP0000004") {
            content = this.createSimulate1Sprite();
        } else if (type === "EQUIP0000005") {
            content = this.createSimulate2Sprite();
        } else if (type === "EQUIP0000006") {
            content = this.createSimulate3Sprite();
        } else content = this.createSimulate3Sprite();

        return content;
    }
    private static createSimulate1Sprite() {
        const content = new op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE();
        content.sprites = [];
        const sprite = new op_client.Sprite();
        sprite.id = 538813404;
        sprite.point3f = new op_def.PBPoint3f();
        sprite.point3f.x = 825; sprite.point3f.y = 352.5; sprite.currentAnimationName = "idle";
        sprite.direction = op_def.Direction.LOWER_LEFT;
        sprite.nickname = "破旧矿车"; sprite.opacity = 100;
        // sprite.animations = [
        //     {
        //         id: 0, name: "walk", frameRate: 5, walkableArea: "",
        //         collisionArea: "", loop: true, originPoint: [0, 0], baseLoc: "-60,-97", frameName: [
        //             "1_1.png", "1_2.png", "1_3.png", "1_4.png", "1_5.png", "1_6.png", "1_7.png", "1_8.png", "1_9.png", "1_10.png", "1_11.png", "1_12.png"]
        //     },
        //     {
        //         id: 0, name: "walk_1", frameRate: 5, walkableArea: "",
        //         collisionArea: "", loop: true, originPoint: [0, 0], baseLoc: "-60,-97", frameName: [
        //             "3_1.png", "3_2.png", "3_3.png", "3_4.png", "3_5.png", "3_6.png", "3_7.png", "3_8.png", "3_9.png", "3_10.png", "3_11.png", "3_12.png"]
        //     },
        //     {
        //         id: 0, name: "idle", frameRate: 5, walkableArea: "0",
        //         collisionArea: "0", loop: true, originPoint: [0, 0], baseLoc: "-56,-97", frameName: ["1_1.png"]
        //     },
        //     {
        //         id: 0, name: "idle_1", frameRate: 5, walkableArea: "0",
        //         collisionArea: "0", loop: true, originPoint: [0, 0], baseLoc: "-59,-97", frameName: ["3_1.png"]
        //     },
        // ];
        sprite.display = {
            dataPath: "pixelpai/ElementNode/5eb3c210f81bf42ecdbee104/2/5eb3c210f81bf42ecdbee104.json",
            texturePath: "pixelpai/ElementNode/5eb3c210f81bf42ecdbee104/2/5eb3c210f81bf42ecdbee104.png"
        };
        content.sprites.push(sprite);
        content.nodeType = op_def.NodeType.ElementNodeType;
        content.packet = {
            currentFrame: 1,
            totalFrame: 1
        };
        return content;
    }
    private static createSimulate2Sprite() {
        const content = new op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE();
        content.sprites = [];
        const sprite = new op_client.Sprite();
        sprite.id = 1692034537;
        sprite.point3f = new op_def.PBPoint3f();
        sprite.point3f.x = 765; sprite.point3f.y = 322.5; sprite.currentAnimationName = "idle";
        sprite.direction = op_def.Direction.LOWER_LEFT;
        sprite.nickname = "木制矿车"; sprite.opacity = 100;
        // sprite.animations = [
        //     {
        //         id: 0, name: "walk_1", frameRate: 5, walkableArea: "",
        //         collisionArea: "", loop: true, originPoint: [0, 0], baseLoc: "-58,-95", frameName: [
        //             "1_1.png", "1_2.png", "1_3.png", "1_4.png", "1_5.png", "1_6.png", "1_7.png", "1_8.png", "1_9.png", "1_10.png", "1_11.png", "1_12.png"
        //         ]
        //     },
        //     {
        //         id: 0, name: "idle", frameRate: 5, walkableArea: "0",
        //         collisionArea: "0", loop: true, originPoint: [0, 0], baseLoc: "-60,-96", frameName: ["3_1.png"]
        //     },
        //     {
        //         id: 0, name: "idle_1", frameRate: 5, walkableArea: "0",
        //         collisionArea: "0", loop: true, originPoint: [0, 0], baseLoc: "-58,-95", frameName: ["1_1.png"]
        //     },
        //     {
        //         id: 0, name: "walk", frameRate: 5, walkableArea: "",
        //         collisionArea: "", loop: true, originPoint: [0, 0], baseLoc: "-58,-95", frameName: [
        //             "3_1.png", "3_2.png", "3_3.png", "3_4.png", "3_5.png", "3_6.png", "3_7.png", "3_8.png", "3_9.png", "3_10.png", "3_11.png", "3_12.png"
        //         ]
        //     }
        // ];
        sprite.display = {
            dataPath: "pixelpai/ElementNode/5eb3c33b5f1dd72ee6411d36/1/5eb3c33b5f1dd72ee6411d36.json",
            texturePath: "pixelpai/ElementNode/5eb3c33b5f1dd72ee6411d36/1/5eb3c33b5f1dd72ee6411d36.png"
        };
        content.sprites.push(sprite);
        content.nodeType = op_def.NodeType.ElementNodeType;
        content.packet = {
            currentFrame: 1,
            totalFrame: 1
        };
        return content;
    }
    private static createSimulate3Sprite() {
        const content = new op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE();
        content.sprites = [];
        const sprite = new op_client.Sprite();
        sprite.id = 675627117;
        sprite.point3f = new op_def.PBPoint3f();
        sprite.point3f.x = 690; sprite.point3f.y = 300; sprite.currentAnimationName = "idle";
        sprite.direction = op_def.Direction.LOWER_LEFT;
        sprite.nickname = "铁甲矿车"; sprite.opacity = 100;
        // sprite.animations = [
        //     {
        //         id: 0, name: "idle", frameRate: 5, walkableArea: "0",
        //         collisionArea: "0", loop: true, originPoint: [0, 0], baseLoc: "-52,-102", frameName: ["1_1.png"]
        //     },
        //     {
        //         id: 0, name: "walk_1", frameRate: 5, walkableArea: "",
        //         collisionArea: "", loop: true, originPoint: [0, 0], baseLoc: "-54,-103", frameName: [
        //             "3_1.png", "3_2.png", "3_3.png", "3_4.png", "3_5.png", "3_6.png", "3_7.png", "3_8.png", "3_9.png", "3_10.png", "3_11.png", "3_12.png"
        //         ]
        //     },
        //     {
        //         id: 0, name: "idle_1", frameRate: 5, walkableArea: "0",
        //         collisionArea: "0", loop: true, originPoint: [0, 0], baseLoc: "-54,-103", frameName: ["3_1.png"]
        //     },
        //     {
        //         id: 0, name: "walk", frameRate: 5, walkableArea: "",
        //         collisionArea: "", loop: true, originPoint: [0, 0], baseLoc: "-54,-103", frameName: [
        //             "1_1.png", "1_2.png", "1_3.png", "1_4.png", "1_5.png", "1_6.png", "1_7.png", "1_8.png", "1_9.png", "1_10.png", "1_11.png", "1_12.png"
        //         ]
        //     }
        // ];
        sprite.display = {
            dataPath: "pixelpai/ElementNode/5eb3c45cd465882ebccba05c/3/5eb3c45cd465882ebccba05c.json",
            texturePath: "pixelpai/ElementNode/5eb3c45cd465882ebccba05c/3/5eb3c45cd465882ebccba05c.png"
        };
        content.sprites.push(sprite);
        content.nodeType = op_def.NodeType.ElementNodeType;
        content.packet = {
            currentFrame: 1,
            totalFrame: 1
        };
        return content;
    }

    private static getMineCarType(attrs: op_def.IStrPair[]) {
        if (attrs && attrs.length > 0) {
            for (const att of attrs) {
                if (att.key === "minecart") {
                    return att.value;
                }
            }
        }
        return null;
    }
}
