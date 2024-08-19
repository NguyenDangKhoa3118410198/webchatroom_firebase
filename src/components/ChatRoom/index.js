import React from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import styled from 'styled-components';

const ChatRoomWrapper = styled.div`
   display: flex;
   max-width: 1440px;
   left: 50%;
   position: relative;
   transform: translateX(-50%);
`;

export default function ChatRoom() {
   return (
      <ChatRoomWrapper>
         <Sidebar />
         <ChatWindow />
      </ChatRoomWrapper>
   );
}
