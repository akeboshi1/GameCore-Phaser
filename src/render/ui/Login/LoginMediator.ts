import { LoginPanel } from "./LoginPanel";
import { LayerManager } from "../Layer.manager";
import { VerifiedPanel } from "./VerifiedPanel";
import { AlertView, Buttons } from "../Components/Alert.view";
import { BaseMediator } from "apowophaserui";
import { WorldService } from "../../world.service";
import { Logger } from "../../../utils/log";

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
        this.mView.on("error", this.onLoginErrorHanler, this);
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
            .catch((err) => {
                this.onLoginErrorHanler("服务器错误，请与管管联系！", "确定");
                Logger.getInstance().error(err);
            });
    }

    private onLoginHandler(phone: string, code: string, areaCode: string) {
        (<LoginPanel>this.mView).setLoginEnable(false);
        this.world.httpService.loginByPhoneCode(phone, code, areaCode).then((response: any) => {
            if (response.code === 200 || response.code === 201) {
                const data = response.data;
                this.world.account.setAccount(data);
                localStorage.setItem("accountphone", JSON.stringify({ account: phone }));
                const verifiedEnable = CONFIG["verified_enable"];
                if (verifiedEnable !== undefined && verifiedEnable === false) {
                    this.enterGame(!verifiedEnable);
                    return;
                }
                if (data.hasIdentityInfo) {
                    this.enterGame(data.adult);
                } else {
                    (<LoginPanel>this.mView).setInputVisible(false);
                    this.onShowVerified();
                }

            } else if (response.code >= 400) {
                this.onLoginErrorHanler(response.msg || "服务器错误");
            }
            (<LoginPanel>this.mView).setLoginEnable(true);
        });
    }

    private onShowVerified() {
        if (!this.verifiedPanel) {
            this.verifiedPanel = new VerifiedPanel(this.layerManager.scene, this.world);
        }
        if (this.verifiedPanel.isShow()) {
            return;
        }
        this.verifiedPanel.show();
        this.verifiedPanel.on("verified", this.onVerifiedHandler, this);
        this.verifiedPanel.on("error", this.onShowErrorHandler, this);
        this.layerManager.addToDialogLayer(this.verifiedPanel);
    }

    private onShowErrorHandler(error, okText?: string) {
        this.verifiedPanel.setVerifiedEnable(false);
        new AlertView(this.layerManager.scene, this.world).setOKText(okText ? okText : "重新输入").show({
            text: error ? error : "[color=#F9361B]证件格式有误[/color]",
            title: "提示",
            callback: () => {
                this.verifiedPanel.setVerifiedEnable(true);
            },
            btns: Buttons.Ok
        });
    }

    private onLoginErrorHanler(error: string, okText?: string) {
        (<LoginPanel>this.mView).setInputVisible(false);
        new AlertView(this.layerManager.scene, this.world).setOKText(okText ? okText : "重新输入").show({
            text: error,
            title: "提示",
            callback: () => {
                (<LoginPanel>this.mView).setInputVisible(true);
            },
            btns: Buttons.Ok
        });
    }

    private onVerifiedHandler(name: string, idcard: string) {
        this.world.httpService.verified(name, idcard).then((response: any) => {
            const { code, data } = response;
            if (code === 200 || code === 201 || code === 0) {
                // this.enterGame(data.adult);
                this.enterGame(true);
            } else if (code === 10001 || code >= 400) {
                // 验证失败
                this.verifiedPanel.setVerifiedEnable(false);
                this.onShowErrorHandler("[color=#F9361B]实名认证失败，身份证号码有误\n请如实进行实名认证！[/color]", "重新认证");
                // this.verifiedPanel.setVisible(false);
                // new AlertView(this.layerManager.scene, this.world).setOKText("重新认证").show({
                //     text: "[color=#F9361B]实名认证失败，身份证号码有误\n请如实进行实名认证！[/color]",
                //     title: "提示",
                //     callback: () => {
                //         this.verifiedPanel.setVerifiedEnable(true);
                //         // this.verifiedPanel.setVisible(true);
                //     },
                //     btns: Buttons.Ok
                // });
            }
        });
    }
}
