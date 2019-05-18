// declare var webRTC: any;
 declare module "Webrtc" {
    export = WebGMEAPI;
}

declare class WebGMEAPI {

    event;
    Init(document: any, sdkAppId: string, openId: string);
    SetTMGDelegate(event: any);
    EnterRoom(roomId, roomType, authBuffer);
    ExitRoom();
    EnableMic(enable: boolean);
}


