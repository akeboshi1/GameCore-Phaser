import { BasicMediator, Game } from "gamecore";
import { ModuleName } from "structure";
import { Logger } from "utils";

export class PicaLoginMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.PICA_LOGIN_NAME, game);
    }

    enterGame() {
        this.game.loginEnterWorld();
    }

    phoneLogin(phone: string, code: string, areaCode: string) {
        this.game.httpService.loginByPhoneCode(phone, code, areaCode).then((response: any) => {
            if (response.code === 200 || response.code === 201) {
                const data = response.data;
                this.loginSuc(response.data);
            } else if (response.code >= 400) {
                if (this.mView) this.mView.showError(response.msg || "服务器错误");
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

    fetchCode(phone: string, areaCode: string) {
        this.game.httpService.requestPhoneCode(phone, areaCode);
    }

    private async loginSuc(data) {
        this.hide();
        const account = await this.game.renderPeer.getAccount();
        if (!account.accountData) {
            const bootMeditor: any = this.game.uiManager.getMed(ModuleName.PICA_BOOT_NAME);
            if (bootMeditor) bootMeditor.showNotice();
        }
        this.game.renderPeer.setAccount(data);
    }
}
