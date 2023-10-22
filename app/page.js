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
  const user1 = useRef(null)
  const user2 = useRef(null)
  const [servers, setServers] = useState({
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
      }
    ]
  })
  // const [stream, setStream] = useState()
  // const [remoteStream, setRemoteStream] = useState(new MediaStream())
  // const [peerConnection, setPeerConnection] = useState(new RTCPeerConnection(servers))
  const [retry, setRetry] = useState(0)


  const setUp = async () => {
    // try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      // setStream(streamm)
      user1.current.srcObject = stream
      // createOffer()
    // } catch (err) {
    //   console.log(err)
    //   // setUp()
    //   setRetry((retry) => retry + 1)
    // }
  }

  // console.log(retry)

  

  const createPeerConnection = async () => {
    // setPeerConnection(new RTCPeerConnection())
    remoteStream = new MediaStream()
    peerConnection = new RTCPeerConnection(servers)
    // setRemoteStream(new MediaStream())
    user2.current.srcObject = remoteStream

    // if(!stream) {
    //   stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
    //   user1.current.srcObject = stream
    // }

    
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream)
      })

    peerConnection.ontrack = (event) => {
      console.log(event)
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track)
      })
    }

    peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log('New ICE candidate:', event.candidate)
        socket.emit("messageFromPeer", {type: 'candidate', candidate: event.candidate})
      }
    }

  }

  const createOffer = async () => {
    console.log("creating offer")
    await createPeerConnection()
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    console.log("Offer:", offer)

    socket.emit("messageFromPeer", {type: "offer", offer: offer})
  }

  let createAnswer = async (offer) => {
    console.log("creating answer")
    await createPeerConnection()
    await peerConnection.setRemoteDescription(offer)

    let answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    socket.emit("messageFromPeer", {type: 'answer', answer: answer})
  }

  let addAnswer = async (answer) => {
    if(!peerConnection.currentRemoteDescription) {
      peerConnection.setRemoteDescription(answer)
    }
  }
  // useEffect(() => {
  //   createOffer()
  // }, [stream])

  //listen for permission change
  //display which webcam and microphone its connected to

  let handleUserJoined = async () => {
    console.log("new user joined the chat")
    createOffer()
  }

  let handleMessageFromPeer = async (message) => {
    console.log("peer sent message")
    if (message.type === "offer") {
      createAnswer(message.offer)
    }

    if (message.type === "answer") {
      addAnswer(message.answer)
    }

    if (message.type === "candidate") {
      if(peerConnection){
        peerConnection.addIceCandidate(message.candidate)
      }
    }
  }

  useEffect(() => {
    console.log('checking')
    socket.on("connect", () => {
      console.log(socket.id)
    })

    socket.on("disconnect", () => {
      console.log(socket.id + "disconnected")
    })

    socket.emit("room:create", "123456")

    socket.emit("room:join", "123456")

    socket.on("user:join", handleUserJoined)

    socket.on("messageFromPeer", handleMessageFromPeer)

    socket.on("room:join:error", (message) => {
      console.log(message)
    })

    // socket.on("room:join", () => {
    //   console.log("testing client to client")
    // })

    socket.on("broadcast:received", handleMessageFromPeer)
    setUp()
  }, [])


  return (
    <main className={styles.main}>
      <video ref={user1} className='video-player' autoPlay playsInline id='user-1'></video>
      <video ref={user2} className='video-player' autoPlay playsInline id='user-2'></video>
    </main>
  )
}
