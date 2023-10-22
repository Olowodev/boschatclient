"use client"

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import styles from './page.module.css'
import { io } from "socket.io-client"


const socket = io("http://localhost:5000")
let peerConnection;
  let remoteStream;
  let stream;
export default function Home() {
  // const user1 = useRef(null)
  // const user2 = useRef(null)
  // const [servers, setServers] = useState({
  //   iceServers: [
  //     {
  //       urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
  //     }
  //   ]
  // })
  // // const [stream, setStream] = useState()
  // // const [remoteStream, setRemoteStream] = useState(new MediaStream())
  // // const [peerConnection, setPeerConnection] = useState(new RTCPeerConnection(servers))
  // const [retry, setRetry] = useState(0)


  // const setUp = async () => {
  //   // try {
  //     stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  //     // setStream(streamm)
  //     user1.current.srcObject = stream
  //     // createOffer()
  //   // } catch (err) {
  //   //   console.log(err)
  //   //   // setUp()
  //   //   setRetry((retry) => retry + 1)
  //   // }
  // }

  // // console.log(retry)

  

  // const createPeerConnection = async () => {
  //   // setPeerConnection(new RTCPeerConnection())
  //   remoteStream = new MediaStream()
  //   peerConnection = new RTCPeerConnection(servers)
  //   // setRemoteStream(new MediaStream())
  //   user2.current.srcObject = remoteStream

  //   // if(!stream) {
  //   //   stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
  //   //   user1.current.srcObject = stream
  //   // }

    
  //     stream.getTracks().forEach((track) => {
  //       peerConnection.addTrack(track, stream)
  //     })

  //   peerConnection.ontrack = (event) => {
  //     console.log(event)
  //     event.streams[0].getTracks().forEach((track) => {
  //       remoteStream.addTrack(track)
  //     })
  //   }

  //   peerConnection.onicecandidate = async (event) => {
  //     if (event.candidate) {
  //       console.log('New ICE candidate:', event.candidate)
  //       socket.emit("messageFromPeer", {type: 'candidate', candidate: event.candidate})
  //     }
  //   }

  // }

  // const createOffer = async () => {
  //   console.log("creating offer")
  //   await createPeerConnection()
  //   const offer = await peerConnection.createOffer()
  //   await peerConnection.setLocalDescription(offer)

  //   console.log("Offer:", offer)

  //   socket.emit("messageFromPeer", {type: "offer", offer: offer})
  // }

  // let createAnswer = async (offer) => {
  //   console.log("creating answer")
  //   await createPeerConnection()
  //   await peerConnection.setRemoteDescription(offer)

  //   let answer = await peerConnection.createAnswer()
  //   await peerConnection.setLocalDescription(answer)

  //   socket.emit("messageFromPeer", {type: 'answer', answer: answer})
  // }

  // let addAnswer = async (answer) => {
  //   if(!peerConnection.currentRemoteDescription) {
  //     peerConnection.setRemoteDescription(answer)
  //   }
  // }
  // // useEffect(() => {
  // //   createOffer()
  // // }, [stream])

  // //listen for permission change
  // //display which webcam and microphone its connected to

  // let handleUserJoined = async () => {
  //   console.log("new user joined the chat")
  //   createOffer()
  // }

  // let handleMessageFromPeer = async (message) => {
  //   console.log("peer sent message")
  //   if (message.type === "offer") {
  //     createAnswer(message.offer)
  //   }

  //   if (message.type === "answer") {
  //     addAnswer(message.answer)
  //   }

  //   if (message.type === "candidate") {
  //     if(peerConnection){
  //       peerConnection.addIceCandidate(message.candidate)
  //     }
  //   }
  // }

  // useEffect(() => {
  //   console.log('checking')
  //   socket.on("connect", () => {
  //     console.log(socket.id)
  //   })

  //   socket.on("disconnect", () => {
  //     console.log(socket.id + "disconnected")
  //   })

  //   socket.emit("room:create", "123456")

  //   socket.emit("room:join", "123456")

  //   socket.on("user:join", handleUserJoined)

  //   socket.on("messageFromPeer", handleMessageFromPeer)

  //   socket.on("room:join:error", (message) => {
  //     console.log(message)
  //   })

  //   // socket.on("room:join", () => {
  //   //   console.log("testing client to client")
  //   // })

  //   socket.on("broadcast:received", handleMessageFromPeer)
  //   setUp()
  // }, [])

  const user1 = useRef()
  const user2 = useRef()
  const rtcConnectionRef = useRef(null)
  // const socketRef = useRef()
  const userStreamRef = useRef()
  const hostRef = useRef(false)

  const handleRoomCreated = async () => {
    console.log("room created")
    hostRef.current = true
    try {
    const stream = await navigator.mediaDevices.getUserMedia({video: true})
    userStreamRef.current = stream
    user1.current.srcObject = stream
    } catch(err) {
      console.log(err)
    }
  }

  const handleRoomJoined = async () => {
    try {
    const stream = await navigator.mediaDevices.getUserMedia({video:true})
    userStreamRef.current = stream
    user1.current.srcObject = stream
    socket.emit('ready', "1234")
    } catch(err) {
      console.log('error', err)
    }
  }

  const initiateCall = async () => {
    try {
    if(hostRef.current) {
      rtcConnectionRef.current = createPeerConnection()
      console.log(userStreamRef.current.getTracks())
      rtcConnectionRef.current.addTrack(
        userStreamRef.current.getTracks()[0],
        userStreamRef.current
      )
      // rtcConnectionRef.current.addTrack(
      //   userStreamRef.current.getTracks()[1],
      //   userStreamRef.current
      // )
      let offer = await rtcConnectionRef.current.createOffer()
      // offer = {...offer, sdp: `${offer.sdp}\n`}
      // console.log(offer)
      rtcConnectionRef.current.setLocalDescription(offer)
      socket.emit('offer', offer, "1234")
    }
  } catch(err) {
    console.log(err)
  }
  }

  const ICE_SERVERS = {
    iceServers: [
      {
        urls: 'stun:openrelay.metered.ca:80'
      }
    ]
  }

  const createPeerConnection = () => {
    const connection = new RTCPeerConnection(ICE_SERVERS)

    connection.onicecandidate = handleICECandidateEvent

    connection.ontrack = handleTrackEvent
    return  connection
  }

  const handleReceivedOffer = async (offer) => {
    try {
    if (!hostRef.current) {
      rtcConnectionRef.current = createPeerConnection()
      rtcConnectionRef.current.addTrack(
        userStreamRef.current.getTracks()[0],
        userStreamRef.current
      )
      // rtcConnectionRef.current.addTrack(
      //   userStreamRef.current.getTracks()[1],
      //   userStreamRef.current
      // )
      rtcConnectionRef.current.setRemoteDescription(JSON.parse(offer))

      const answer = await rtcConnectionRef.current.createAnswer()
      rtcConnectionRef.current.setLocalDescription(answer)
      socket.emit('answer', answer, "1234")
    }
  } catch (err) {
    console.log(err)
  }
  }

  const handleAnswer = (answer) => {
    rtcConnectionRef.current.setRemoteDescription(answer)
      .catch((err) => console.log(err))
  }

  const handleICECandidateEvent = (event) => {
    if(event.candidate){
      socket.emit('ice-candidate', event.candidate, "1234")
    }
  }

  const handleNewIceCandidateMsg = (incoming) => {
    const candidate = new RTCIceCandidate(incoming)
    rtcConnectionRef.current.addIceCandidate(candidate)
      .catch((e) => console.log(e))
  }

  const handleTrackEvent = (event) => {
    user2.current.srcObject = event.streams[0]
  }

  useEffect(() => {
    // socket = socket

    socket.on('connect', ()=>{
      console.log("it connected")
    })
    socket.emit('join', "1234")
    socket.on('created', handleRoomCreated)
    socket.on('joined', handleRoomJoined)
    socket.on('ready', initiateCall)
    // socket.on('leave', onPeerLeave)
    socket.on('full', () => {
      console.log('room is full')
    })
    socket.on('offer', handleReceivedOffer)
    socket.on('answer', handleAnswer)
    socket.on('ice-candidate', handleNewIceCandidateMsg)

    // return () => socket.disconnect()
  }, [])




  return (
    <main className={styles.main}>
      <video ref={user1} className='video-player' autoPlay playsInline id='user-1'></video>
      <video ref={user2} className='video-player' autoPlay playsInline id='user-2'></video>
    </main>
  )
}
