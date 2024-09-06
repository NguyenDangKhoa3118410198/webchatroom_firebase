import React, { useContext, useEffect, useState } from 'react';
import { Avatar, Button, Dropdown, Menu, Typography } from 'antd';
import { AppContext } from '../Context/AppProvider';
import styled from 'styled-components';
import {
   collection,
   deleteDoc,
   getDocs,
   onSnapshot,
   query,
   where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { AuthContext } from '../Context/AuthProvider';
import {
   AppstoreOutlined,
   ClearOutlined,
   LockOutlined,
   MoreOutlined,
   TeamOutlined,
} from '@ant-design/icons';
import { Modal } from 'antd';

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
   const { confirm } = Modal;
   const [filterStatus, setFilterStatus] = useState('all');
   const [unreadMessagesCount, setUnreadMessagesCount] = useState({});

   const showConfirm = () => {
      return new Promise((resolve) => {
         confirm({
            title: 'Are you sure?',
            content: 'Delete all messages',
            onOk() {
               resolve(true);
            },
            onCancel() {
               resolve(false);
            },
         });
      });
   };

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

   useEffect(() => {
      let roomIds;
      const roomIdsPrivate = roomPrivate.map((o) => o.id);
      const roomIdsPublic = rooms.map((o) => o.id);

      roomIds = [...roomIdsPrivate, ...roomIdsPublic];

      const unsubscribe = roomIds.map((roomId) => {
         const q = query(
            collection(db, 'messages'),
            where('roomId', '==', roomId)
         );

         return onSnapshot(q, (querySnapshot) => {
            let unreadCount = 0;

            querySnapshot.forEach((doc) => {
               const seen = doc.data().seen;
               if (seen && seen[`${uid}`] === false) {
                  unreadCount++;
               }
            });

            setUnreadMessagesCount((prevCounts) => ({
               ...prevCounts,
               [roomId]: unreadCount,
            }));
         });
      });

      return () => {
         unsubscribe.forEach((unsub) => unsub());
      };
   }, [roomPrivate, rooms, uid]);

   const handleDeleteAllMessageByRoomId = async (roomId) => {
      const confirm = await showConfirm();
      if (!confirm) return;
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, where('roomId', '==', roomId));

      try {
         const querySnapshot = await getDocs(q);

         const deletePromises = querySnapshot.docs.map((doc) =>
            deleteDoc(doc.ref)
         );

         await Promise.all(deletePromises);
      } catch (error) {
         console.error('Error deleting messages by roomId:', error);
      }
   };

   const handleFilterByStatus = (status) => {
      setFilterStatus(status);
   };

   return (
      <>
         <FilterStatus>
            <FilterButton
               onClick={() => handleFilterByStatus('all')}
               bgcolor='#fff'
               color='#a3cbf8'
               border='#f0f2f7'
               icon={<AppstoreOutlined />}
            >
               All
            </FilterButton>
            <FilterButton
               onClick={() => handleFilterByStatus('rooms')}
               bgcolor='#fff'
               color='#a3cbf8'
               border='#f0f2f7'
               icon={<TeamOutlined />}
            >
               Room
            </FilterButton>
            <FilterButton
               onClick={() => handleFilterByStatus('private')}
               bgcolor='#fff'
               color='#a3cbf8'
               border='#f0f2f7'
               icon={<LockOutlined />}
            >
               Private
            </FilterButton>
         </FilterStatus>
         <PanelStyled>
            {(filterStatus === 'rooms' || filterStatus === 'all') && (
               <BorderRoom>
                  <h1 className='title-room'>Groups</h1>
                  {rooms.map((room) => {
                     const avatarText = room.name.charAt(0).toUpperCase();
                     const unreadCount = unreadMessagesCount[room.id] || 0;
                     const menu = (
                        <Menu
                           items={[
                              {
                                 key: 'delete',
                                 label: 'Delete all',
                                 onClick: () =>
                                    handleDeleteAllMessageByRoomId(room.id),
                              },
                           ]}
                        />
                     );
                     return (
                        <LinkStyled
                           key={room.id}
                           onClick={() => {
                              setSelectedRoomId(room.id);
                              setActiveItem(true);
                           }}
                           className={
                              selectedRoomId === room.id ? 'active' : ''
                           }
                        >
                           <Avatar className='avatar' size={40}>
                              {avatarText}
                           </Avatar>
                           <span className='name'>{room.name}</span>
                           <div className='more-options'>
                              <Dropdown
                                 overlay={menu}
                                 trigger={['click']}
                                 placement='top'
                                 arrow
                              >
                                 <MoreOutlined className='more-icon' />
                              </Dropdown>
                           </div>
                           {unreadCount && unreadCount > 0 ? (
                              <NotReadWrapper>
                                 <div className='not-read-text'>
                                    {unreadCount ?? 0}
                                 </div>
                              </NotReadWrapper>
                           ) : null}
                        </LinkStyled>
                     );
                  })}
               </BorderRoom>
            )}

            {(filterStatus === 'private' || filterStatus === 'all') && (
               <BorderRoom>
                  <h1 className='title-room'>Personal</h1>
                  {roomPrivate.map((item) => {
                     const otherParticipantId = item.members.find(
                        (id) => id !== uid
                     );
                     const otherMember = userDetails[otherParticipantId];
                     const avatarText =
                        otherMember?.displayName?.charAt(0)?.toUpperCase() ||
                        '?';
                     const unreadCount = unreadMessagesCount[item.id] || 0;
                     const menu = (
                        <Menu
                           items={[
                              {
                                 key: 'delete',
                                 label: 'Delete All',
                                 icon: (
                                    <ClearOutlined
                                       style={{ fontSize: '16px' }}
                                    />
                                 ),
                                 onClick: () =>
                                    handleDeleteAllMessageByRoomId(item.id),
                              },
                           ]}
                        />
                     );

                     return (
                        <div style={{ display: 'flex' }}>
                           <LinkStyled
                              key={item.id}
                              onClick={() => {
                                 setSelectedRoomId(item.id);
                                 setActiveItem(true);
                              }}
                              className={
                                 selectedRoomId === item.id ? 'active' : ''
                              }
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
                                 {otherMember?.displayName ?? 'Anonymous'}
                              </span>
                              <div className='more-options'>
                                 <Dropdown
                                    overlay={menu}
                                    trigger={['click']}
                                    placement='top'
                                    arrow
                                 >
                                    <MoreOutlined className='more-icon' />
                                 </Dropdown>
                              </div>
                              {unreadCount && unreadCount > 0 ? (
                                 <NotReadWrapper>
                                    <div className='not-read-text'>
                                       {unreadCount ?? 0}
                                    </div>
                                 </NotReadWrapper>
                              ) : null}
                           </LinkStyled>
                        </div>
                     );
                  })}
               </BorderRoom>
            )}
         </PanelStyled>
      </>
   );
}

const PanelStyled = styled.div`
   padding: 0 10px;
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

   .more-options {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 30px;
      width: 30px;
      background-color: #fff;
      border-radius: 50%;
      opacity: 0.4;

      .more-icon {
         height: 100%;
         width: 100%;
         display: flex;
         justify-content: center;
         align-items: center;
      }
   }

   &:hover {
      .more-options {
         opacity: 1;
      }
   }
`;

const FilterStatus = styled.div`
   display: flex;
   gap: 10px;
   justify-content: flex-start;
   margin: 5px;
   padding: 4px 10px;
   overflow-x: auto;

   &::-webkit-scrollbar {
      display: none;
   }

   scrollbar-width: none;

   -ms-overflow-style: none;
`;

const FilterButton = styled(Button)`
   background-color: ${(props) => (props.bgcolor ? props.bgcolor : '#fff')};
   color: ${(props) => (props.color ? props.color : '#000')};
   font-weight: 500;
   font-size: 14px;
   border: 1px solid ${(props) => (props.border ? props.border : '#fff')};
   border-radius: 40px;

   &:hover {
      color: ${(props) => (props.color ? props.color : '#000')} !important;
   }
   span:hover {
      color: ${(props) => (props.color ? props.color : '#000')};
   }
`;

const NotReadWrapper = styled.div`
   width: 18px;
   height: 18px;
   background-color: #fc2727;
   text-align: center;
   border-radius: 50%;
   margin: 4px 2px 4px 4px;

   .not-read-text {
      text-align: center;
      font-size: 11px;
      color: #fff;
   }
`;

const BorderRoom = styled.div`
   border: 2px solid #f0f0f0;
   border-radius: 20px;
   padding: 14px;
   margin: 0 5px 10px 5px;

   .title-room {
      font-size: 22px;
      margin: 4px 0;
   }
`;
