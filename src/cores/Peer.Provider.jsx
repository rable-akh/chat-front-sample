import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

const PeerContext = React.createContext(null);

export const usePeer = () => {
    const peerMod = useContext(PeerContext)
    return peerMod
}

export const PeerProvider = (props) => {

    const [remoteStream, setRemoteStream] = useState(null)

    const peer = useMemo( 
        () => new RTCPeerConnection({
        iceServers: [
            {'urls': 'stun:stun.l.google.com:19302'}
        ]
    }), [])

    const createOffer = async () => {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer)
        return offer
    }

    const createAnswer = async (offer) => {
        await peer.setLocalDescription(offer);
        const answer = await peer.createAnswer()
        await peer.setLocalDescription(answer)
        return offer
    }

    const setRemoteAnswer = async (answer) => {
        await peer.setRemoteDescription(answer);
    }

    const sendStream = async (stream) => {
        const tracks = stream.getTracks();
        for(const track of tracks){
            peer.addTrack(track, stream)
        }
    }

    const handleTrackEvent = useCallback((ev) => {
        const streams = ev.streams;
        console.log(streams[0]);
        setRemoteStream(streams[0])
    }, [])

    useEffect(() => {
        peer.addEventListener('track', handleTrackEvent)
        return () => {
            peer.removeEventListener('track', handleTrackEvent)
        }
    }, [handleTrackEvent, peer])

    return (
        <PeerContext.Provider value={{ peer, createOffer, createAnswer, setRemoteAnswer, sendStream, remoteStream}}>
            {props.children}
        </PeerContext.Provider>
    )
}