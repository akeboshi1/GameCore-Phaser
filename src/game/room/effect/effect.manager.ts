import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_virtual_world, op_client, op_def } from "pixelpai_proto";
import { IRoomService } from "../room/room";
import { Effect } from "./effect";

export class EffectManager extends PacketHandler {
    private mEffects: Map<number, Effect>;
    constructor(private room: IRoomService) {
        super();
        this.mEffects = new Map();
        this.connection.addPacketListener(this);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_SPRITE, this.onSyncSprite);
    }

    public add(ownerID: number, id?: number) {
        let effect = this.mEffects.get(ownerID);
        if (!effect) {
            effect = new Effect(this.room.game, ownerID, id);
        }
        this.mEffects.set(ownerID, effect);
        this.updateDisplay(effect);
        return effect;
    }

    public remove(ownerID: number) {
        const effect = this.mEffects.get(ownerID);
        if (!effect) {
            return;
        }
        this.mEffects.delete(ownerID);
        effect.destroy();
    }

    public getByOwner(ownerID: number) {
        let effect = this.mEffects.get(ownerID);
        if (!effect) {
            effect = this.add(ownerID);
        }
        return effect;
    }

    public getByID(id: number) {
        const effects = Array.from(this.mEffects.values());
        return effects.filter((effect) => id === effect.id);
    }

    public destroy() {
        this.mEffects.forEach((effect) => {
            effect.destroy();
        });
        this.mEffects.clear();
        this.connection.removePacketListener(this);
    }

    protected updateDisplay(effect: Effect) {
        const id = effect.id;
        const display = this.room.game.elementStorage.getDisplayModel(id);
        if (display) {
            effect.displayInfo = display;
        } else {
            this.fetchDisplay([id]);
        }
    }

    protected fetchDisplay(ids: number[]) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_REQ_VIRTUAL_WORLD_QUERY_SPRITE_RESOURCE);
        const content: op_virtual_world.IOP_REQ_VIRTUAL_WORLD_QUERY_SPRITE_RESOURCE = packet.content;
        content.ids = ids;
        this.connection.send(packet);
    }

    private onSyncSprite(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_SPRITE = packet.content;
        if (content.nodeType !== op_def.NodeType.ElementNodeType) {
            return;
        }
        const sprites = content.sprites;
        for (const sprite of sprites) {
            this.mEffects.forEach((effect) => {
                if (effect.id === sprite.id) {
                    effect.syncSprite(sprite);
                }
            });
        }
    }

    get connection() {
        return this.room.game.connection;
    }
}
