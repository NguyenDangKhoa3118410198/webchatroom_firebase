import React, { useContext, useEffect, useState } from 'react';
import { Avatar, Typography } from 'antd';
import { AppContext } from '../Context/AppProvider';
import styled from 'styled-components';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AuthContext } from '../Context/AuthProvider';

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
      color: var(--color-black);

      &:hover {
         color: var(--color-black);
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
   const {
      roomPrivate,
      rooms,
      setSelectedRoomId,
      selectedRoomId,
      setActiveItem,
   } = useContext(AppContext);
   const { uid } = useContext(AuthContext);
   const [userDetails, setUserDetails] = useState({});

   useEffect(() => {
      const fetchUserDetails = async () => {
         const userIds = roomPrivate
            .flatMap((room) => room.members)
            .filter((id) => id !== uid);

         if (userIds.length === 0) return;

         const usersQuery = query(
            collection(db, 'users'),
            where('uid', 'in', userIds)
         );
         const querySnapshot = await getDocs(usersQuery);
         const users = querySnapshot.docs.reduce((acc, doc) => {
            acc[doc.data().uid] = doc.data();
            return acc;
         }, {});
         setUserDetails(users);
      };

      fetchUserDetails();
   }, [roomPrivate, uid]);

   return (
      <PanelStyled>
         {rooms.map((room) => {
            const avatarText = room.name.charAt(0).toUpperCase();

            return (
               <LinkStyled
                  key={room.id}
                  onClick={() => {
                     setSelectedRoomId(room.id);
                     setActiveItem(true);
                  }}
                  className={selectedRoomId === room.id ? 'active' : ''}
               >
                  <Avatar className='avatar' size={40}>
                     {avatarText}
                  </Avatar>
                  <span className='name'>{room.name}</span>
               </LinkStyled>
            );
         })}

         {roomPrivate.map((item) => {
            const otherParticipantId = item.members.find((id) => id !== uid);
            const otherMember = userDetails[otherParticipantId];
            const avatarText =
               otherMember?.displayName?.charAt(0)?.toUpperCase() || '?';

            return (
               <LinkStyled
                  key={item.id}
                  onClick={() => {
                     setSelectedRoomId(item.id);
                     setActiveItem(true);
                  }}
                  className={selectedRoomId === item.id ? 'active' : ''}
               >
                  {otherMember?.photoURL ? (
                     <Avatar
                        src={otherMember?.photoURL}
                        className='avatar'
                        size={40}
                     />
                  ) : (
                     <Avatar className='avatar' size={40}>
                        {avatarText}
                     </Avatar>
                  )}
                  <span className='name'>
                     {otherMember ? otherMember.displayName : 'Unknown'}
                  </span>
               </LinkStyled>
            );
         })}
      </PanelStyled>
   );
}
