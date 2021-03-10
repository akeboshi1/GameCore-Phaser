import { BasicMediator, Game } from "gamecore";
import { ModuleName } from "structure";
import { Logger } from "utils";

export class PicaBootMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.PICA_BOOT_NAME, game);
    }

    showLogin() {
        this.game.showMediator(ModuleName.PICA_LOGIN_NAME, true);
    }

    phoneLogin(phone, code, areaCode) {
        this.game.httpService.loginByPhoneCode(phone, code, areaCode)
            .then((response: any) => {
                if (response.code === 200 || response.code === 201) {

                }
            });
    }

    enterGame() {
        this.game.loginEnterWorld();
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
                // this.onLoginErrorHanler("服务器错误，请与管管联系！", "确定");
                Logger.getInstance().error(err);
            });
    }

    public onLoginHandler(phone: string, code: string, areaCode: string) {
        this.game.httpService.loginByPhoneCode(phone, code, areaCode).then((response: any) => {
            if (response.code === 200 || response.code === 201) {
                const data = response.data;
                this.loginSuc(response.data);
            }
                // localStorage.setItem("accountphone", JSON.stringify({ account: phone }));
                // const verifiedEnable = CONFIG["verified_enable"];
            //     if (this.verifiedEnable !== undefined && this.verifiedEnable === false) {
            //         this.enterWorld(!this.verifiedEnable);
            //         return;
            //     }
            //     if (data.hasIdentityInfo) {
            //         this.enterWorld(data.adult);
            //     } else {
            //         // TODO
            //         this.game.renderPeer.setInputVisible(false);
            //         this.onShowVerified();
            //     }

            // } else if (response.code >= 400) {
            //     this.onLoginErrorHanler(response.msg || "服务器错误");
            // }
        });
    }

    private loginSuc(data) {
        this.game.renderPeer.setAccount(data);
    }
}
