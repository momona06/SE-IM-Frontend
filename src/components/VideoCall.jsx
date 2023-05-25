import React, {useEffect, useState} from 'react';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import VideocamIcon from '@mui/icons-material/Videocam';
import CableIcon from '@mui/icons-material/Cable';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

const VideoCall = (userName, userToCall) => {
    let localVideo = document.querySelector('#localVideo');
    let remoteVideo = document.querySelector('#remoteVideo');

    let iceCandidatesFromCaller = [];
    let callInProgress = false;
    let otherUser;
    let remoteRTCMessage;
    let peerConnection;
    let remoteStream = "default";
    let localStream;
    let callSocket;
    let isVideo;

    let pcConfig = {
        "iceServers": [{
            "url": "stun:stun.jap.bloggernepal.com:5349"
        }, {
            "url": "turn:turn.jap.bloggernepal.com:5349",
            "username": "guest",
            "credential": "somepassword"
        }, {
            "url": "stun:stun.l.google.com:19302"
        }]
    };

    function login() {
        connectSocket();
    }


    function connectSocket() {
        // callSocket = new WebSocket("ws://localhost:8000/ws/call/");
        callSocket = new WebSocket("wss://se-im-backend-overflowlab.app.secoder.net/ws/call/");
        callSocket.onopen = event => {
            callSocket.send(JSON.stringify({
                type: 'login',
                data: {
                    name: userName
                }
            }));
        };

        callSocket.onmessage = (e) => {
            let response = JSON.parse(e.data);
            let type = response.type;

            if(type == 'connection') {
                console.log(response.data.message);
                alert("Connected!");
            }

            else if(type == 'call_received') {
                onNewCall(response.data);
            }

            else if(type == 'call_answered') {
                onCallAnswered(response.data);
            }

            else if(type == 'call_stopped') {
                stopCall();
            }

            else if(type == 'ICEcandidate') {
                onICECandidate(response.data);
            }


        }

        const stopCall = () => {
            if(typeof localStream != "undefined" && localStream != null && typeof peerConnection != "undefined" && peerConnection != null) {
                localStream.getTracks().forEach(track => track.stop());
                peerConnection.close();
            }
            callInProgress = false;
            peerConnection = null;

            document.getElementById("audiocall").style.display = "inline";
            document.getElementById("videocall").style.display = "inline";

            document.getElementById("answer").style.display = "none";
            document.getElementById("stop").style.display = "none";

            document.getElementById("videos").style.display = "none";

        }

        const onNewCall = (data) => {
            otherUser = data.caller;
            remoteRTCMessage = data.rtcMessage;

            document.getElementById("answer").style.display = "inline";
            document.getElementById("stop").style.display = "inline";
        };


        const onCallAnswered = (data) => {
            remoteRTCMessage = data.rtcMessage;
            if(typeof peerConnection != "undefined" && peerConnection != null) {
                peerConnection.setRemoteDescription(new RTCSessionDescription(remoteRTCMessage));
            }
            callProgress();
        };

        const onICECandidate = (data) => {
            let message = data.rtcMessage;

            let candidate = new RTCIceCandidate({
                sdpMLineIndex: message.label,
                candidate: message.candidate
            });

            if (peerConnection) {

                try {
                    if(peerConnection != null) {
                        peerConnection.addIceCandidate(candidate)
                            .then(done => {
                            console.log(done);
                        })
                            .catch(error => {
                            console.log(error);
                        })
                    }
                }
                catch (error) {
                    console.log(error);
                }
            }

            else {
                iceCandidatesFromCaller.push(candidate);
            }
        };
    }


    function stop() {
        localStream.getTracks().forEach(track => track.stop());
        callInProgress = false;
        peerConnection.close();
        peerConnection = null;
        otherUser = null;

        document.getElementById("videos").style.display = "none";

        document.getElementById("answer").display = "none";
        document.getElementById("stop").display = "none";

        document.getElementById("audiocall").display = "inline";
        document.getElementById("videocall").display = "inline";

        console.log("stop by myself");
        callSocket.send(JSON.stringify({
            type: 'stop_call',
            data: {
                name: userToCall
            }
        }));

    }



    function preProcess() {
        beReady().
            then(bool => {processCall(userToCall);});
    }

    function videoCall() {
        isVideo = true;

        document.getElementById("answer").style.display = "inline";
        document.getElementById("stop").style.display = "inline";

        document.getElementById("videos").style.display="block";

        otherUser = userToCall;
        beReady()
            .then(bool => {
                processCall(userToCall)
            })
    }

    function audioCall() {
        isVideo = false;

        document.getElementById("answer").style.display = "inline";
        document.getElementById("stop").style.display = "inline";

        document.getElementById("videos").style.display="none";

        otherUser = userToCall;
        beReady()
            .then(bool => {
                processCall(userToCall)
            })
    }


    function answer() {
        beReady()
            .then(bool => {
                processAccept();
            });
    }


    function sendCall(data) {
        // send a call
        callSocket.send(JSON.stringify({
            type: 'call',
            data
        }));
    }

    function answerCall(data) {
        callSocket.send(JSON.stringify({
            type: 'answer_call',
            data
        }));
        callProgress();
    }

    function sendICEcandidate(data) {
        callSocket.send(JSON.stringify({
            type: 'ICEcandidate',
            data
        }));
    }

    function beReady() {
        return navigator.mediaDevices.getUserMedia({
            audio: true,
            video: isVideo
        })
            .then(stream => {
                localStream = stream;
                localVideo.srcObject = stream;
                return createConnectionAndAddStream()
            })
            .catch(function (e) {
                alert('getUserMedia() error: ' + e.name);
            });
    }

    function createConnectionAndAddStream() {
        createPeerConnection();
        peerConnection.addStream(localStream);
        return true;
    }

    function createPeerConnection() {
        try {
            peerConnection = new RTCPeerConnection(pcConfig);
            peerConnection.onicecandidate = handleIceCandidate;
            peerConnection.onaddstream = handleRemoteStreamAdded;
            peerConnection.onremovestream = handleRemoteStreamRemoved;
        }
        catch (e) {
            console.log('Failed to create PeerConnection, exception: ' + e.message);
        }
    }


    function handleIceCandidate(event) {
        if (event.candidate) {
            sendICEcandidate({
                user: otherUser,
                rtcMessage: {
                    label: event.candidate.sdpMLineIndex,
                    id: event.candidate.sdpMid,
                    candidate: event.candidate.candidate
                }
            })
        }
    }

    function handleRemoteStreamAdded(event) {
        remoteStream = event.stream;
        remoteVideo.srcObject = remoteStream;
    }

    function handleRemoteStreamRemoved(event) {
        remoteVideo.srcObject = null;
        localVideo.srcObject = null;
    }

    function processCall(otherName) {
        peerConnection.createOffer((sessionDescription) => {
            peerConnection.setLocalDescription(sessionDescription);
            sendCall({
                name: otherName,
                rtcMessage: sessionDescription
            })
        }, (error) => {
            console.log("Error");
        });
    }

    function processAccept() {

        peerConnection.setRemoteDescription(new RTCSessionDescription(remoteRTCMessage));
        peerConnection.createAnswer((sessionDescription) => {
            peerConnection.setLocalDescription(sessionDescription);
            if (iceCandidatesFromCaller.length > 0) {
                for (let i = 0; i < iceCandidatesFromCaller.length; i++) {
                    let candidate = iceCandidatesFromCaller[i];
                    try {
                        if(peerConnection != null) {
                            peerConnection.addIceCandidate(candidate).then(done => {
                                console.log(done);
                            }).catch(error => {
                                console.log(error);
                            })
                        }
                    }
                    catch (error) {
                        console.log(error);
                    }
                }
                iceCandidatesFromCaller = [];
            }

            answerCall({
                caller: otherUser,
                rtcMessage: sessionDescription
            });

        }, (error) => {
            console.log("Error");
        })
    }


    function callProgress() {
        document.getElementById("videos").style.display = "block";
        callInProgress = true;
    }

    window.onbeforeunload = function () {
        if (callInProgress) {
            stop();
            callSocket.close();
        }
    };


    return (
        <div direction={"horizontal"}>
            <div>
                <GroupAddIcon id="login" onClick={login}/>
                <HeadphonesIcon id="audiocall" onClick={audioCall}/>
                <VideocamIcon id="videocall" onClick={videoCall}/>
                <CableIcon style={{display: "none"}} id="answer" onClick={answer}/>
                <StopCircleIcon style={{display: "none"}} id="stop" onClick={stop}/>
            </div>


            <div id="videos" style={{display: "none"}}>
                <div style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        paddingRight: 20,
                        paddingTop: 20
                    }}>
                    <video
                        width="100px"
                        id="localVideo"
                        autoPlay
                        muted
                        playsInline/>
                </div>
                <video style={{width: 500}}
                    id="remoteVideo"
                    autoPlay
                    playsInline/>
            </div>


        </div>
    );
};


export default VideoCall;