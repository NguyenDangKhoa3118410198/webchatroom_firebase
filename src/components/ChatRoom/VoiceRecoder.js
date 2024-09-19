import { AudioMutedOutlined, AudioOutlined } from '@ant-design/icons';
import React, { useRef } from 'react';
import styled, { css, keyframes } from 'styled-components';

export const VoiceRecoder = ({
   setAudioBlob,
   setRecording,
   recording,
   setAudioURL,
}) => {
   const mediaRecorderRef = useRef(null);

   const startRecording = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
         const audioBlob = event.data;
         setAudioBlob(audioBlob);
         const audioUrl = URL.createObjectURL(audioBlob);
         setAudioURL(audioUrl);
      };
      mediaRecorderRef.current.start();
      setRecording(true);
   };

   const stopRecording = () => {
      mediaRecorderRef.current.stop();
      setRecording(false);
   };

   return (
      <WrapperIcon
         onClick={recording ? stopRecording : startRecording}
         recording={recording}
      >
         {recording ? (
            <AudioMutedOutlined style={{ color: 'red' }} />
         ) : (
            <AudioOutlined />
         )}
      </WrapperIcon>
   );
};

const blink = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
`;

const WrapperIcon = styled.div`
   display: flex;
   align-items: center;
   justify-content: center;
   ${(props) =>
      props.recording &&
      css`
         animation: ${blink} 1s infinite;
      `}
`;
