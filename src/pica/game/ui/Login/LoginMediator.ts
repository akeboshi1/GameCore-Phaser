import { BasicMediator, Game } from "gamecore";
import { ModuleName } from "structure";
import { Logger } from "utils";

export class LoginMediator extends BasicMediator {
    private verifiedEnable: boolean = false;
    constructor(game: Game) {
        super(ModuleName.LOGIN_NAME, game);
    }

    show(param?: any) {
        super.show(param);
    }

    login(phone, code, areaCode) {
        this.onLoginHandler(phone, code, areaCode);
    }

    public onFetchCodeHandler(phone: string, areaCode: string) {
        this.game.httpService.requestPhoneCode(phone, areaCode);
    }

    public enterWorld(adult: boolean) {
        this.game.peer.httpClockEnable(!adult);
        if (adult) {
            this.destroy();
            this.game.loginEnterWorld();
            return;
        }
        this.game.httpClock.allowLogin(() => { this.game.renderPeer.setInputVisible(true); })
            .then((allow: boolean) => {
                if (allow) {
                    this.destroy();
                    this.game.loginEnterWorld();
                } else {
                    this.game.renderPeer.setInputVisible(false);
                }
            })
            .catch((err) => {
                this.onLoginErrorHanler("服务器错误，请与管管联系！", "确定");
                Logger.getInstance().error(err);
            });
    }

    public onLoginHandler(phone: string, code: string, areaCode: string) {
        this.game.renderPeer.setLoginEnable(true);
        this.game.httpService.loginByPhoneCode(phone, code, areaCode).then((response: any) => {
            if (response.code === 200 || response.code === 201) {
                const data = response.data;
                this.game.renderPeer.setAccount(data);
                // localStorage.setItem("accountphone", JSON.stringify({ account: phone }));
                // const verifiedEnable = CONFIG["verified_enable"];
                if (this.verifiedEnable !== undefined && this.verifiedEnable === false) {
                    this.enterWorld(!this.verifiedEnable);
                    return;
                }
                if (data.hasIdentityInfo) {
                    this.enterWorld(data.adult);
                } else {
                    // TODO
                    this.game.renderPeer.setInputVisible(false);
                    this.onShowVerified();
                }

            } else if (response.code >= 400) {
                this.onLoginErrorHanler(response.msg || "服务器错误");
            }
            this.game.renderPeer.setLoginEnable(true);
        });
    }

    public onShowVerified() {
        this.game.renderPeer.onShowVerified();
    }

    public onShowErrorHandler(error, okText?: string) {
        this.game.renderPeer.onShowErrorHandler(error, okText);
    }

    public onLoginErrorHanler(error: string, okText?: string) {
        this.game.renderPeer.setInputVisible(false);
        this.game.renderPeer.onLoginErrorHanler(error, okText);
    }

    public onVerifiedHandler(name: string, idcard: string) {
        this.game.httpService.verified(name, idcard).then((response: any) => {
            const { code, data } = response;
            if (code === 200 || code === 201 || code === 0) {
                // this.enterWorld(data.adult);
                this.enterWorld(true);
            } else if (code === 10001 || code >= 400) {
                // 验证失败
                this.game.renderPeer.setVerifiedEnable(false);
                this.onShowErrorHandler("[color=#F9361B]实名认证失败，身份证号码有误\n请如实进行实名认证！[/color]", "重新认证");
            }
        });
    }
}
