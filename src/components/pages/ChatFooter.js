import React, {useState} from 'react'
import { callUser, hangup, peerConnect } from '../../cores/RTCCore'
import {Button, Modal} from 'react-bootstrap'
import { usePeer } from '../../cores/Peer.Provider'
import ReactPlayer from "react-player"

const ChatFooter = ({socket, selectedUser, calling, setCalling, audioRef, call, remoteStreamRef, myStream}) => {

    const { peer, createOffer, sendStream } = usePeer()

    const userD = localStorage.getItem("user")?JSON.parse(localStorage.getItem("user")):{}

    const [message, setMessage] = useState("")

    // const [myStream, setMyStream] = useState(null)
    
    const handleTyping = () => socket.emit("typing", {to: selectedUser._id, msg: `${userD?.user} is typing`})
    const handleTypingStop = () => socket.emit("typing", {to: selectedUser._id, msg: ""})

    const handleSendMessage = (e) => {
        e.preventDefault()
        if(message.trim() && userD?.user) {
            socket.emit("privateMessage", 
                {
                    to: selectedUser?._id,
                    text: message, 
                    name: userD?.user, 
                    id: userD?._id,
                    socketID: socket.id
                }
            )
        }
        setMessage("")
    }

    const onHandleCall = async (e) => {
        e.preventDefault()

        sendStream(myStream)
        
        const offer = await createOffer();
        socket.emit("call-user", {
            offer, 
            to: selectedUser?._id,
            toUsr: selectedUser?.user, 
            from: userD?._id,
            fromUsr: userD?.user
        })
        
        setCalling(true)

        // const constraints = {
        //     'video': true,
        //     'audio': true
        // }
        // // callUser(socket, selectedUser?._id, selectedUser?.user, userD?._id, userD?.user)
        // // setCalling(true)
        // navigator.mediaDevices.getUserMedia(constraints)
        // .then(async stream => {
        //     // console.log('Got MediaStream:', stream);
        //     // callUser(socket, selectedUser?._id, selectedUser?.user, userD?._id, userD?.user, stream)
        //     stream.getTracks().forEach(track => peer.addTrack(track, stream));
        //     // peer.ontrack = (e) => {
        //     //     if (audioRef.current) {
        //     //         console.log(e.streams[0]);
        //     //         audioRef.current.srcObject = e.streams[0];
        //     //     }
        //     // }
            
        //     audioRef.current.srcObject = stream;
            
        //     const offer = await createOffer();
        //     socket.emit("call-user", {
        //         offer, 
        //         to: selectedUser?._id,
        //         toUsr: selectedUser?.user, 
        //         from: userD?._id,
        //         fromUsr: userD?.user
        //     })
            
        //     setCalling(true)
        //     // audioRef.current.play();
        // })
        // .catch(error => {
        //     alert("You have not any devices.")
        //     console.error('Error accessing media devices.', error);
        // });
    }

    const onHandleAnswer = async (e) => {

        sendStream(myStream)

        setCalling(true)
        
        const answer = await peer.createAnswer()
        await peer.setLocalDescription( new RTCSessionDescription(answer));
        

        socket.emit("make-answer", {
            answer, 
            to: selectedUser?._id,
            toUsr: selectedUser?.user, 
            from: userD?._id,
            fromUsr: userD?.user
        })
        
        // const constraints = {
        //     'video': true,
        //     'audio': true
        // }
        // navigator.mediaDevices.getUserMedia(constraints)
        // .then(async stream => {
        //     // console.log('Got MediaStream:', stream);
        //     stream.getTracks().forEach(track => peer.addTrack(track, stream));
        //     // madeAnswer(socket, data)

        //     // audioRef.current.srcObject = stream[0]

        //     // await peer.setRemoteDescription(
        //     //     new RTCSessionDescription(data.offer)
        //     // )

        //     // const state = peer.signalingState;
        //     // const iceConnectionState = peer.iceConnectionState;

        //     // console.log('addAnswer',state);
        //     // console.log('addAnswer',iceConnectionState);
        //     setCalling(true)
        
        //     const answer = await peer.createAnswer()
        //     await peer.setLocalDescription( new RTCSessionDescription(answer));
            

        //     socket.emit("make-answer", {
        //         answer, 
        //         to: selectedUser?._id,
        //         toUsr: selectedUser?.user, 
        //         from: userD?._id,
        //         fromUsr: userD?.user
        //     })
        //     // audioRef.current.play();
        //     // socket.on('answer-made', (data) => {

        //     //     // addAnswer(socket, data, isAlreadyCalling, setIsAlreadyCalling)
        //     // })
        // })
        // .catch(error => {
        //     alert("You have not any devices.")
        //     console.error('Error accessing media devices.', error);
        // });
        
    }

    const onCallHandleCancel = (e) => {
        setCalling(false)
        const constraints = {
            'video': false,
            'audio': true
        }
        navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            console.log('Stop MediaStream:', stream);
            // hangup(stream)
            audioRef.current.stop();
        })
    }
    return (
        <>
        <div className='chat__footer'>
            <div className='d-flex justify-content-center'>
                <form className='form' onSubmit={handleSendMessage}>
                <input 
                    type="text" 
                    placeholder='Write message' 
                    className='message' 
                    value={message} 
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={handleTyping}
                    onKeyUp={handleTypingStop}
                    />
                    <button className="sendBtn">SEND</button>
                    <button type='button' onClick={onHandleCall} className="btn btn-sm btn-primary">Call</button>
                </form>
            </div>
        </div>

        {/* <ReactPlayer url={myStream}/> */}
        
        <Modal show={calling}>
            <Modal.Header>
            <Modal.Title>{selectedUser?._id === userD?._id?"Outgoing":"Incomming"} Call</Modal.Title>
            </Modal.Header>
            <Modal.Body>{} calling you.</Modal.Body>
            <Modal.Footer>
            <Button variant="danger" onClick={call}>
                Cancel
            </Button>
            <Button variant="warning" onClick={onHandleAnswer}>
                Answer
            </Button>
            </Modal.Footer>
        </Modal>
        </>
    )
}

export default ChatFooter