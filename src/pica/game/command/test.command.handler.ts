import { InputEnable, MessageHandler } from "gamecore";
import { PBpacket } from "net-socket-packet/dist/src/Packet";
import { EventType, ModuleName } from "structure";
import { Logger } from "utils";
import { op_client, op_virtual_world, op_def } from "pixelpai_proto";

export class TestCommandHandler extends MessageHandler {
    onAddListener() {
        this.emitter.on(EventType.TEST_COMMAND_MESSAGE, this.onTestHandler, this);
    }
    onRemoveListener() {
        this.emitter.off(EventType.TEST_COMMAND_MESSAGE, this.onTestHandler, this);
    }

    destroy() {
        super.destroy();
    }
    protected onTestHandler(tag: string) {
        if (tag === "mine") {
            this.game.user.stopMove();
            this.game.user.setInputEnable(InputEnable.Diasble);
            this.game.renderPeer.displayAction("mineexplosive", { id: this.game.user.id, isSelf: true });
        } else if (tag === "guide") {
            this.game.showMediator(ModuleName.PICAMARQUEE_NAME, true, {
                guideID: "1",
                guideText: ["这是一段无人可知的故事，故事曲折坎坷，婉转凄美，每个人都有一段故事，想要听吗"],
                id: 571973460,
                inputText: [],
                kvps: [],
                menuItem: [],
                name: "PlaneGuide_1",
                text: [],
                time: []
            });
        } else {
            Logger.getInstance().log("*****************     " + tag);
            this.game.showMediator(ModuleName.PICAMARQUEE_NAME, true, { tips: "请注意", content: "这是一段很长的测试文字，那个小青蛙手动阀手动阀撒大噶山豆根", count: 3 });
        }
    }

    protected testFinishGuide() {
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_TAKE_GALLARY_PROGRESS_REWARD);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_TAKE_GALLARY_PROGRESS_REWARD = pkt.content;
        content.type = 1;
        this.connection.send(pkt);
    }
}
