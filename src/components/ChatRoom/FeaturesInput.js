import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { PaperClipOutlined, SmileOutlined } from '@ant-design/icons';
import { VoiceRecoder } from './VoiceRecoder';
import EmojiPicker from 'emoji-picker-react';

export const FeaturesInput = forwardRef(
   (
      {
         handleUpload,
         setAudioBlob,
         setRecording,
         setAudioURL,
         recording,
         handleEmojiOpen,
         openEmoji,
         handleEmojiSelect,
         pickerRef,
      },
      ref
   ) => {
      return (
         <>
            <SubFeature onClick={handleUpload}>
               <PaperClipOutlined />
            </SubFeature>

            <SubFeature>
               <VoiceRecoder
                  setAudioBlob={setAudioBlob}
                  setRecording={setRecording}
                  setAudioURL={setAudioURL}
                  recording={recording}
               />
            </SubFeature>
            <div style={{ position: 'relative' }}>
               <SubFeature onClick={handleEmojiOpen} ref={ref}>
                  <SmileOutlined />
               </SubFeature>
               <PopupEmoji>
                  <div
                     style={{
                        position: 'absolute',
                        bottom: '50px',
                        left: 0,
                     }}
                     ref={pickerRef}
                  >
                     <EmojiPicker
                        open={openEmoji}
                        onEmojiClick={handleEmojiSelect}
                     />
                  </div>
               </PopupEmoji>
            </div>
         </>
      );
   }
);

const SubFeature = styled.div`
   margin: 5px;
   padding: 5px;
   display: inline-flex;
   align-items: center;
   justify-content: center;
   cursor: pointer;
   font-size: 20px;
   color: #08c;

   &:hover {
      background-color: #f0f0f0;
      border-radius: 50%;
   }
`;

const PopupEmoji = styled.div`
   position: relative;
`;
