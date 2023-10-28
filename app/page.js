"use client"

import { useEffect, useRef, useState } from "react"
import io from 'socket.io-client'

const socket = io("http://localhost:5000")

export default function Home () {
  const localVideoRef = useRef()
  const remoteVideoRef = useRef()
  const pc = useRef()
  const textRef = useRef()
  const [stream, setStream] = useState()
  const candidates = useRef([])
  const mediaRecorder = useRef()

  useEffect(() => {
    const contraints = {
      audio: true,
      video: {
        facingMode: 'environment'
      }
    }
    console.log('getting media')

    socket.on("connect", () => {
      console.log('it connected')
    })

    socket.on('sdp', data => {
      console.log(data)
      textRef.current.value = JSON.stringify(data.sdp)
    }) 

    socket.on("candidate", candidate => {
      console.log(candidate)
      candidates.current = [...candidates.current, candidate]
    })

    navigator.mediaDevices.getUserMedia(contraints)
    .then(stream => {
      localVideoRef.current.srcObject = stream

      setStream(stream)
    })
    .catch(e => {
      console.log('getUserMedia Error')
    })

    const _pc = new RTCPeerConnection(null)
    _pc.onicecandidate = (e) => {
      if(e.candidate) {
        console.log(JSON.stringify(e.candidate))
        socket.emit("candidate", e.candidate)
      }
    }

    _pc.oniceconnectionstatechange = (e) => {
      console.log(e) //connected, disconnected, peered and closed
    }

    _pc.ontrack = (e) => {
      remoteVideoRef.current.srcObject = e.streams[0]
      // console.log(e.streams[0].getAudioTracks())
      mediaRecorder.current = new MediaRecorder(e.streams[0])
    }

    pc.current = _pc
  }, [])

  useEffect(() => {
    if (stream && pc.current) {
    stream.getTracks().forEach(track => {
      pc.current.addTrack(track, stream)
    })
  }
  }, [stream, pc.current])

  const createOffer = () => {
    pc.current.createOffer({
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1
    }).then(sdp => {
      console.log(JSON.stringify(sdp))
      pc.current.setLocalDescription(sdp)

      socket.emit('sdp', {sdp})
    }).catch(e => console.log(e))
  }

  const createAnswer = () => {
    pc.current.createAnswer({
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1
    }).then(sdp => {
      console.log(JSON.stringify(sdp))
      pc.current.setLocalDescription(sdp)

      socket.emit('sdp', {sdp})
    }).catch(e => console.log(e))
  }

  const setRemoteDescription = () => {
    const sdp = JSON.parse(textRef.current.value)
    console.log(sdp)

    pc.current.setRemoteDescription(new RTCSessionDescription(sdp))
  }

  const addCandidate = () => {
    // const candidate = JSON.parse(textRef.current.value)
    // console.log('Adding Candidate...', candidate)

    candidates.current.forEach(candidate => {
      console.log(candidate)
    pc.current.addIceCandidate(new RTCIceCandidate(candidate))
  })

  }

  const getUserMedia = () => {
    const contraints = {
      audio: false,
      video: true
    }
    console.log('getting media')

    navigator.mediaDevices.getUserMedia(contraints)
    .then(stream => {
      localVideoRef.current.srcObject = stream

      stream.getTracks().forEach(track => {
        _pc.addTrack(track, stream)
      })
    })
    .catch(e => {
      console.log('getUserMedia Error')
    })
  }
  return (
    <div style={{ margin: 10}}>
      <button onClick={getUserMedia}>Get access to camera</button>
      <br />
      <div className="videoContainer">
      <video style={{ margin: 5, backgroundColor: 'black'}} ref={localVideoRef} muted autoPlay></video>
      <video style={{ margin: 5, backgroundColor: 'black'}} ref={remoteVideoRef} autoPlay></video>
      </div>
      <br />
      <button onClick={createOffer}>Create Offer</button>
      <button onClick={createAnswer}>Create Answer</button>
      <br />
      <textarea ref={textRef}></textarea>
      <br />
      <button onClick={setRemoteDescription}>Set Remote Description</button>
      <button onClick={addCandidate}>Add Candidates</button>
    </div>
  );
}