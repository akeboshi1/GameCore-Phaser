import { Logger } from "../../utils/log";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { LoginPanel } from "./LoginPanel";
import { LayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { VerifiedPanel } from "./VerifiedPanel";
import { AlertView, Buttons } from "../components/alert.view";

export class LoginMediator extends BaseMediator {
    private verifiedPanel: VerifiedPanel;
    constructor(private layerManager: LayerManager, scene: Phaser.Scene, private world: WorldService) {
        super();
    }

    show() {
        if (!this.mView) {
            this.mView = new LoginPanel(this.layerManager.scene, this.world);
        }
        this.mView.show();
        this.mView.on("fetchCode", this.onFetchCodeHandler, this);
        this.mView.on("login", this.onLoginHandler, this);
        this.layerManager.addToUILayer(this.mView);
    }

    destroy() {
        super.destroy();
        if (this.verifiedPanel) {
            this.verifiedPanel.destroy();
            this.verifiedPanel = null;
        }
    }

    private onFetchCodeHandler(phone: string, areaCode: string) {
        this.world.httpService.requestPhoneCode(phone, areaCode);
    }

    private enterGame(adult: boolean) {
        if (this.world.httpClock) this.world.httpClock.enable = !adult;
        if (adult) {
            this.destroy();
            this.world.enterGame();
            return;
        }
        this.world.httpClock.allowLogin(() => { (<LoginPanel>this.mView).setInputVisible(true); })
            .then((allow: boolean) => {
                if (allow) {
                    this.destroy();
                    this.world.enterGame();
                } else {
                    (<LoginPanel>this.mView).setInputVisible(false);
                }
            })
            .catch(Logger.getInstance().error);
    }

    private onLoginHandler(phone: string, code: string, areaCode: string) {
        this.world.httpService.loginByPhoneCode(phone, code, areaCode).then((response: any) => {
            if (response.code === 200 || response.code === 201) {
                const data = response.data;
                this.world.account.setAccount(data);
                localStorage.setItem("accountphone", JSON.stringify({ account: phone }));
                // this.enterGame(true);
                if (data.hasIdentityInfo) {
                    this.enterGame(data.adult);
                } else {
                    (<LoginPanel>this.mView).setInputVisible(false);
                    this.onShowVerified();
                }
            }
        });
    }

    private onShowVerified() {
        if (!this.verifiedPanel) {
            this.verifiedPanel = new VerifiedPanel(this.layerManager.scene, this.world);
        }
        this.verifiedPanel.show();
        this.verifiedPanel.on("verified", this.onVerifiedHandler, this);
        this.layerManager.addToDialogLayer(this.verifiedPanel);
    }

    private onVerifiedHandler(name: string, idcard: string) {
        this.world.httpService.verified(name, idcard).then((response: any) => {
            const { code, data } = response;
            if (code === 200 || code === 201) {
                this.enterGame(data.adult);
            } else if (code === 10001) {
                // 验证失败
                this.verifiedPanel.setInputVisible(false);
                // this.verifiedPanel.setVisible(false);
                new AlertView(this.layerManager.scene, this.world).setOKText("重新认证").show({
                    text: "[color=#F9361B]实名认证失败，身份证号码有误，\n请如实进行实名认证！[/color]",
                    title: "提示",
                    callback: () => {
                        this.verifiedPanel.setInputVisible(true);
                        // this.verifiedPanel.setVisible(true);
                    },
                    btns: Buttons.Ok
                });
            }
        });
    }
}
