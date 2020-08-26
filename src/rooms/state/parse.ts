import { Buffer } from "buffer/";
import { Logger } from "../../utils/log";

export class StateParse {
    static decode(name: string, packet: Uint8Array) {
        if (this[name]) {
            return StateParse[name](packet);
        }
        return StateParse.json(packet);
    }

    static json(packet: Uint8Array) {
        const buf = Buffer.from(packet);
        const len = buf.readUInt32BE(0);
        try {
            const content = buf.slice(4);
            if (len === content.length) {
                return JSON.parse(content.toString());
            }
            Logger.getInstance().error(`parse packet error. packet length: ${len} received length: ${content.length}`);
        } catch (error) {
            Logger.getInstance().error(error);
        }
    }

    static setCameraBounds(packet: Uint8Array) {
        const buf = Buffer.from(packet);
        if (!buf) {
            return;
        }
        let x = 0;
        let y = 0;
        let width = buf.readDoubleBE(0);
        let height = buf.readDoubleBE(8);
        if (buf.length >= 24) {
            x = buf.readDoubleBE(0);
            y = buf.readDoubleBE(8);
            width = buf.readDoubleBE(16);
            height = buf.readDoubleBE(24);
        } else {
            x = -width * 0.5;
            y = -height * 0.5;
        }
        return { x, y, width, height };
    }

}
