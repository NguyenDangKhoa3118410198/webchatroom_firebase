import { AudioMutedOutlined, AudioOutlined } from '@ant-design/icons';
import React, { useRef } from 'react';

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
      <div
         onClick={recording ? stopRecording : startRecording}
         style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
         }}
      >
         {recording ? (
            <AudioMutedOutlined style={{ color: 'red' }} />
         ) : (
            <AudioOutlined />
         )}
      </div>
   );
};
