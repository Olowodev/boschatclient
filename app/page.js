"use client"

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import styles from './page.module.css'

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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
      // setStream(streamm)
      user1.current.srcObject = stream
      createOffer(stream)
    } catch (err) {
      console.log(err)
      // setUp()
      setRetry((retry) => retry + 1)
    }
  }

  // console.log(retry)

  let peerConnection;

  const createOffer = async (stream) => {
    // setPeerConnection(new RTCPeerConnection())
    const remoteStream = new MediaStream()
    peerConnection = new RTCPeerConnection(servers)
    // setRemoteStream(new MediaStream())
    user2.current.srcObject = remoteStream

    if (stream) {
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream)
      })
    }

    peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack()
      })
    }

    peerConnection.onicecandidate = async (event) => {
      if(event.candidate) {
        console.log('New ICE candidate:', event.candidate)
      }
    }

    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
  }

  // useEffect(() => {
  //   createOffer()
  // }, [stream])

  //listen for permission change
  //display which webcam and microphone its connected to
  
  useEffect(() => {
    setUp()
    console.log('checking')
  }, [])


  return (
    <main className={styles.main}>
      <video ref={user1} className='video-player' autoPlay playsInline id='user-1'></video>
      <video ref={user2} className='video-player' autoPlay playsInline id='user-2'></video>
    </main>
  )
}
