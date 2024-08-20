import React, { useContext } from 'react';
import { Avatar, Typography } from 'antd';
import { AppContext } from '../Context/AppProvider';
import styled from 'styled-components';

const PanelStyled = styled.div`
   padding: 1rem;
   p {
      color: white;
   }

   .ant-collapse-content-box {
      padding: 0 1rem;
   }

   .add-room {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;

      &.ant-btn:hover {
         border-color: #fff;
      }
   }
   overflow-y: auto;
`;

const LinkStyled = styled(Typography.Link)`
   display: flex;
   align-items: center;
   margin-bottom: 5px;
   width: 100%;
   border-radius: 10px;
   padding: 10px;
   font-size: 15px;
   font-weight: 500;
   cursor: pointer;
   background-color: transparent;
   height: 60px;

   &:active,
   &.active {
      background-color: #f0f0f0;
   }

   &:hover {
      background-color: #f0f0f0;
   }

   &.ant-typography {
      color: #000;

      &:hover {
         color: #ccc;
      }
   }

   .avatar {
      border-radius: 50%;
      margin-right: 10px;
      background-color: #ccc;
      flex-shrink: 0;
      font-size: 20px;
   }

   .name {
      flex: 1;
   }
`;

export default function RoomList() {
   const { rooms, setSelectedRoomId, selectedRoomId } = useContext(AppContext);

   return (
      <PanelStyled>
         {rooms.map((room) => {
            const avatarText = room.name.charAt(0).toUpperCase();

            return (
               <LinkStyled
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={selectedRoomId === room.id ? 'active' : ''}
               >
                  <Avatar className='avatar' size={40}>
                     {avatarText}
                  </Avatar>
                  <span className='name'>{room.name}</span>
               </LinkStyled>
            );
         })}
      </PanelStyled>
   );
}
