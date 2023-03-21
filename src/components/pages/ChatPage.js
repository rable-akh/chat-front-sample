import axios from 'axios'
import React, { useEffect, useState, useRef, useCallback} from 'react'
import { addAnswer, madeAnswer, peerConnect } from '../../cores/RTCCore'
import ChatBar from './ChatBar'
import ChatBody from './ChatBody'
import ChatFooter from './ChatFooter'

import { usePeer } from '../../cores/Peer.Provider'

const ChatPage = ({socket}) => { 
  const { peer, createOffer, remoteStream } = usePeer()

  const [messages, setMessages] = useState([])
  const [typingStatus, setTypingStatus] = useState("")
  const [isAlreadyCalling, setIsAlreadyCalling] = useState(false)
  const lastMessageRef = useRef(null);

  const audioRef = useRef(null);
  const remoteStreamRef = useRef(null);
  
  const [calling, setCalling] = useState(false)

  const [users, setUsers] = useState([])
  const [newMsgFrom, setNewMsgFrom] = useState(null)

  // const [bodyShow, setBodyShow] = useState(false);

  const [selectUser, setSelectUser] = useState(null)
  const userD = localStorage.getItem("user")?JSON.parse(localStorage.getItem("user")):{}

    const getUser = async () => {
      axios.get('http://localhost:4000/users')
      .then((res) => {
          if(res.status===200){
          setUsers(res.data)
          }
      })
      .catch((e) => {

      })
  }
  useEffect(()=> {
    getUser()
    socket.on("activeUserResponse", data => setUsers(data))

    socket.on("userLeave", (data) => {
        console.log(data);
    })

    socket.connect()
  }, [socket])

  useEffect(() => {
    const rs = new MediaStream()
    remoteStreamRef.current = rs
    var rd = localStorage.getItem("user")?JSON.parse(localStorage.getItem("user")):{}
    socket.auth = {user: rd.user}
    // socket.on("connect", () => {
    //   console.log(socket.id);
    // });
    socket.connect()
  },[])

  useEffect(()=> {
    
    socket.on("pvtMsgResponse", (data) => {
      setMessages([...messages, data])
    })
    socket.connect()
  }, [socket, messages])

  useEffect(()=> {
    socket.on("typingResponse", data => setTypingStatus(data))

    socket.on("newMessages", (data) => {
      setNewMsgFrom(data)
    })
    
    socket.on("disconnect", data => console.log(data))

    
    socket.on("invited", (data) => {
      socket.emit("joinUser", data)
    })
    
    socket.connect()
  }, [socket])



  const callMade = useCallback(
    async (d) => {
      await peer.setRemoteDescription(
        new RTCSessionDescription(d.offer)
      )
      setCalling(true)
    },
    [peer],
  )

  const answerCall = useCallback(async (data) => {      

    await peer.setRemoteDescription(
      new RTCSessionDescription(data.answer)
    );

    // const state = peer.signalingState;
    // const iceConnectionState = peer.iceConnectionState;

    // console.log('addAnswer',state);
    // console.log('addAnswer',iceConnectionState);

    setCalling(false)
    
    console.log(remoteStream);
    remoteStreamRef.current.srcObject = remoteStream

    socket.emit("answer-success", {to: data.from, msg:"answer"})

    // addAnswer(socket, data, isAlreadyCalling, setIsAlreadyCalling)
    // audioRef.current.pause();
  },[peer, remoteStream, socket])
  
  const callSuccess = useCallback((d) => {
    setCalling(false)
    console.log(remoteStream);
    remoteStreamRef.current.srcObject = remoteStream
  } ,[remoteStream])

  useEffect(() => {
    // audioRef.current.play();
    // socket.on('call-made', async (data) => {
    // //   audioRef.current.play();
    // //   const constraints = {
    // //     'video': false,
    // //     'audio': true
    // //   }
    // //   navigator.mediaDevices.getUserMedia(constraints)
    // //   .then(stream => {
    // //       console.log('Got MediaStream:', stream);
    // //       stream.getTracks().forEach(track => peerConnect().addTrack(track, stream));
    // //       madeAnswer(socket, data)
    //     await peer.setRemoteDescription(
    //       new RTCSessionDescription(data.offer)
    //     )
    //     setCalling(true)
    // //       // audioRef.current.play();
    // //   })
    // //   .catch(error => {
    // //       alert("You have not any devices.")
    // //       console.error('Error accessing media devices.', error);
    // //   });
    // })

    socket.on('call-made', callMade)

    socket.on('answer-made', answerCall)

    socket.on("answer-response", callSuccess)
    socket.connect()
    return () => {
      socket.off('call-made', callMade)
      socket.off('answer-made', answerCall)
      socket.off("answer-response", callSuccess)
    }
  }, [peer, socket, answerCall, callMade, callSuccess])

  useEffect(() => {
    // 👇️ scroll to bottom every time messages change
    lastMessageRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  const handleSelected = async (d) => {
    setMessages([])
    setSelectUser(d)
    socket.emit("create", {room: d._id+userD._id, userId: d._id, withId: userD._id, socketId: socket.id})
    console.log(d);
    socket.connect()
    // socket.on("invited", (data) => {
      
    // })

    axios.get(`http://localhost:4000/messages/${d._id}/${userD._id}`)
    .then((d) => {
      console.log(d.data);
      setMessages(d.data.data)
    })
    .catch((e) => {
      console.log(e);
    })
  }

  return (
    <div className="chat">
      <ChatBar socket={socket} selectedUser={handleSelected} users={users} setUsers={setUsers} newmsgfrom={newMsgFrom}/>
      <div className='chat__main'>
        {
          selectUser&&(
            <>
              <ChatBody socket={socket} selectedUser={selectUser} messages={messages} typingStatus={typingStatus} lastMessageRef={lastMessageRef}/>
              <ChatFooter socket={socket} selectedUser={selectUser} calling={calling} setCalling={setCalling} audioRef={audioRef} remoteStreamRef={remoteStreamRef}/>
            </>
          )
        }
      <audio ref={audioRef} autoPlay/>
      <audio ref={remoteStreamRef} autoPlay/>
      </div>
    </div>
  )
}

export default ChatPage