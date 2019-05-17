// import {PBpacket, Buffer} from "net-socket-packet";
// import {WS} from "../renderer/net/transport/websocket"; // 是这样?
// const _websock = new WS(); // 是new?
// // const $ = require("jquery");
//
// let socket;
// let packetHandlers = new Map();
// let gmeAPI = new wrs.WebGMEAPI();
import "webrtc";

//
// const __log = (m) => {

//     document.getElementById("log").innerHTML += "\n" + (m || "");
//     console.log(m);
// };
// const __err = (e, m) => {
//     document.getElementById("log").innerHTML += "\n" + e + ":" + (m || "");
//     console.error(e, m);
// };
// const __info = (m) => {
//     document.getElementById("info").innerText = m || "";
// };
//
// const {op_gateway, op_gameconfig, op_client, op_virtual_world} = require("pixelpai_proto");
// PBpacket.addProtocol(op_client);
// PBpacket.addProtocol(op_gateway);
// PBpacket.addProtocol(op_gameconfig);
// PBpacket.addProtocol(op_virtual_world);
//
// const sdkAppId = "1400209172"
//     , roomType = 1;
// let roomId, openId, authBuffer;
//
//
// export const _connect = () => {
//     if (socket) return;
//     try {
//         socket = new WS("ws://172.18.0.100", 12100);
//         socket.binaryType = "arraybuffer";
//         _addCallback();
//     } catch (e) {
//         console.error(e);
//     }
//
// };
// const _onData = (ev) => {
//     if (!ev.data) return;
//     const data = ev.data;
//     let pb_pkt = new PBpacket();
//     pb_pkt.Deserialization(new Buffer(data));
//     const callbackFunc = packetHandlers.get(pb_pkt.opcode);
//     if (callbackFunc) {
//         try {
//             callbackFunc.call(this, pb_pkt);
//         } catch (e) {
//             __err(e.errorCode, e.message);
//         }
//     }
// };
//
// const _send = (buf) => {
//     if (socket) {
//         try {
//             socket.send(buf);
//         } catch (e) {
//             __err(e.errorCode, e.message);
//         }
//     }
// };
//
// const _addCallback = () => {
//     if (!socket) return;
//     socket.onmessage = _onData;
//     socket.onopen = () => {
//         __log(`SocketConnection ready.`);
//         // enter game
//         _enterVirtualWorld();
//     };
//     socket.onclose = () => {
//         __log(`SocketConnection close.`);
//         socket = undefined;
//     };
//     socket.onerror = (reason) => {
//         __err(reason.errorCode, `SocketConnection error.` + reason.message);
//     };
//     packetHandlers.set(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_ERROR, p => {
//         let err = p.content;
//         __err(err.responseStatus, err.msg);
//     });
//     packetHandlers.set(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT, p => {
//         __log(`On world inited.`);
//         let {terrain_Types, element_Types, item_Types, avatarBackbone, resourceRoot} = p.content;
//         // fade game created
//         let pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_GAME_CREATED);
//         _send(pkt.Serialization());
//     });
//     packetHandlers.set(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER, p => {
//         __log(`On selected character.`);
//         const characterId = p.content.selectCharacterId;
//         __log(`characterId: ${characterId}`);
//
//         // start game
//         let pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_CHARACTER_CREATED);
//         _send(pkt.Serialization());
//     });
//
//     packetHandlers.set(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE, p => {
//         __log(`On enter scene.`);
//
//         roomId = p.content.scene.id;
//         openId = p.content.actor.id;
//         __log(`roomId: ${roomId}, openId: ${openId}`);
//
//         let pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_QCLOUD_GME_AUTHBUFFER);
//         pkt.content.roomId = roomId;
//         _send(pkt.Serialization());
//     });
//
//     packetHandlers.set(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_QCLOUD_GME_AUTHBUFFER, p => {
//         __log(`On GME authbuffer.`);
//         authBuffer = p.content.signature;
//
//         _initGME();
//     });
// };
//
//
// const _enterVirtualWorld = () => {
//     __log(`Enter VirtualWorld...`);
//     let pkt = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT);
//     const content = pkt.content;
//     content.virtualWorldUuid = "65539";
//     content.gameId = "5cdb663b79f84b2ca5c276a3";
//     content.userToken = "b2d79360e432eb4792f1acb3ffda687ea5d778ba";
//     content.expire = "1558430940";
//     content.fingerprint = "80228de9c7d8952ae3eb79e52881e399e88d56a3";
//     _send(pkt.Serialization());
// };
//
// window.onload = () => {
//     setInterval(_loop, 1000);
// };
//
// const _initGME = () => {
//
//     gmeAPI.Init(document, sdkAppId, openId);
//     gmeAPI.SetTMGDelegate((event, result) => {
//         switch (event) {
//             case gmeAPI.event.ITMG_MAIN_EVENT_TYPE_ENTER_ROOM:
//                 __log(`[GME]: EnterRoom >> ${result}`);
//                 break;
//             case gmeAPI.event.ITMG_MAIN_EVNET_TYPE_USER_UPDATE:
//                 // __log(`[GME]: UserUpdate.`);
//                 __info(`Info: 发送码率: ${result.UploadBRSend} | RTT: ${result.UploadRTT} -- Peer: ${JSON.stringify(result.PeerInfo)}`);
//                 break;
//             case gmeAPI.event.ITMG_MAIN_EVENT_TYPE_EXIT_ROOM:
//                 __log(`[GME]: ExitRoom`);
//                 break;
//             case gmeAPI.event.ITMG_MAIN_EVENT_TYPE_ROOM_DISCONNECT:
//                 __log(`[GME]: Room Disconnect!!!`);
//                 break;
//             default:
//                 // WOW~
//                 break;
//         }
//     });
//     // $("#start_btn").click(() => {
//     //     // let auth = new AuthBufferService(sdkAppId, roomId.toString(), openId.toString(), "U7vKcMeURdJlCXSy");
//     //     // authBuffer = auth.getSignature();
//     //     __log(`Start -- roomid: ${roomId}, userSig: ${authBuffer}`);
//     //     gmeAPI.EnterRoom(roomId, roomType, authBuffer);
//     // });
//     // $("#quit_btn").click(function () {
//     //     gmeAPI.ExitRoom();
//     // });
//     // $("#open_autio_btn").click(() => {
//     //     gmeAPI.EnableMic(true);
//     // });
//     //
//     // $("#close_autio_btn").click(() => {
//     //     gmeAPI.EnableMic(false);
//     // });
// };
//
// const _loop = () => {
//     _connect();
// };

