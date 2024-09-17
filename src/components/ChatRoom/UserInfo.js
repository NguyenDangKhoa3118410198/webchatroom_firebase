import { Avatar, Dropdown, Input, Menu, Typography } from 'antd';
import { signOut } from 'firebase/auth';
import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { auth, db } from '../firebase/config';

import { AuthContext } from '../Context/AuthProvider';
import { MoreOutlined, UserOutlined } from '@ant-design/icons';
import { AppContext } from '../Context/AppProvider';
import { LogoutOutlined, PlusOutlined } from '@ant-design/icons';
import useDebounce from '../../hooks/useDebounce';
import {
   collection,
   doc,
   getDoc,
   getDocs,
   query,
   setDoc,
   updateDoc,
   where,
} from 'firebase/firestore';

export default function UserInfo() {
   const { displayName, photoURL, uid } = useContext(AuthContext);
   const { setAddRoomVisible, setSelectedRoomId, setActiveItem } =
      useContext(AppContext);
   const [search, setSearch] = useState('');
   const [users, setUsers] = useState([]);
   const [rooms, setRooms] = useState([]);
   const [loading, setLoading] = useState(false);
   const debouncedSearchTerm = useDebounce(
      search,
      search.trim().length > 0 ? 400 : 0
   );

   useEffect(() => {
      const fetchUsers = async () => {
         setLoading(true);
         try {
            let querySnapshot;

            const emailQuerySnapshot = await getDocs(
               query(
                  collection(db, 'users'),
                  where('email', '>=', debouncedSearchTerm),
                  where('email', '<=', debouncedSearchTerm + '\uf8ff'),
                  where('uid', '!=', uid)
               )
            );

            if (emailQuerySnapshot.empty) {
               querySnapshot = await getDocs(
                  query(
                     collection(db, 'users'),
                     where('keywords', 'array-contains', debouncedSearchTerm)
                  )
               );
            } else {
               querySnapshot = emailQuerySnapshot;
            }

            const userList = querySnapshot.docs.map((doc) => ({
               label: doc?.data()?.displayName ?? 'Anonymous',
               value: doc?.data()?.uid,
               photoURL: doc?.data()?.photoURL,
               uid: doc?.data()?.uid,
            }));

            const roomQuerySnapshot = await getDocs(
               query(
                  collection(db, 'rooms'),
                  where('name', '>=', debouncedSearchTerm),
                  where('name', '<=', debouncedSearchTerm + '\uf8ff')
               )
            );
            const roomList = roomQuerySnapshot.docs.map((doc) => ({
               label: doc?.data()?.name ?? 'Unknown Room',
               id: doc?.id,
            }));

            setUsers(userList);
            setRooms(roomList);
         } catch (error) {
            console.error('Error fetching users:', error);
         } finally {
            setLoading(false);
         }
      };

      if (debouncedSearchTerm) {
         fetchUsers();
      } else {
         setUsers([]);
         setRooms([]);
      }
   }, [debouncedSearchTerm, uid]);

   const handleAddRoom = () => {
      setAddRoomVisible(true);
   };

   const menuItems = [
      {
         key: 'create-room',
         icon: <StyledPlusIcon />,
         label: <StyledMenuItem> Create room </StyledMenuItem>,
         onClick: handleAddRoom,
         style: { color: '#00b9f5' },
      },
      {
         key: 'logout',
         icon: <StyledLogoutIcon />,
         label: <StyledMenuItem> Logout </StyledMenuItem>,
         onClick: () => {
            signOut(auth);
         },
         style: { color: '#ff1b1b' },
      },
   ];

   const handleSearch = async (e) => {
      setSearch(e.target.value);
   };

   const createRoomId = (user1Id, user2Id) => {
      if (user1Id === user2Id) return false;
      return [user1Id, user2Id].sort().join('_');
   };

   const handleChat = async (uidSelected, isPrivate = false) => {
      const roomId = isPrivate ? createRoomId(uidSelected, uid) : uidSelected;

      if (!roomId) {
         return;
      }

      const roomRef = doc(db, isPrivate ? 'privateChats' : 'rooms', roomId);
      try {
         const roomSnapshot = await getDoc(roomRef);

         const currentTime = new Date();

         if (roomSnapshot.exists()) {
            if (isPrivate) {
               await updateDoc(roomRef, { latestMessageTime: currentTime });
               setSelectedRoomId(roomId);
            } else {
               await updateDoc(doc(db, 'rooms', roomId), {
                  latestMessageTime: currentTime,
               });
            }
         } else {
            await setDoc(roomRef, {
               members: [uidSelected, uid],
               createdAt: currentTime,
               latestMessageTime: currentTime,
            });
         }

         setSelectedRoomId(roomId);
         setActiveItem(true);
      } catch (error) {
         console.error(
            'Error checking room existence or creating room:',
            error
         );
      } finally {
         setSearch('');
      }
   };

   const combinedList = [
      ...users.map((user) => ({ ...user, type: 'user' })),
      ...rooms.map((room) => ({ ...room, type: 'room' })),
   ];

   const menu = <Menu items={menuItems} />;

   return (
      <WrapperStyled>
         <UserInfoStyled>
            {displayName ? (
               <Avatar src={photoURL} size={40}>
                  {photoURL ? '' : displayName?.charAt(0)?.toUpperCase()}
               </Avatar>
            ) : (
               <Avatar icon={<UserOutlined />} size={40} alt='Error' />
            )}

            <Typography.Text className='username'>
               {displayName ?? 'Anonymous'}
            </Typography.Text>
         </UserInfoStyled>
         <Dropdown overlay={menu} trigger={['click']} placement='bottom' arrow>
            <MoreOutlined className='more-icon' />
         </Dropdown>
         <InputStyled
            type='text'
            placeholder='Enter something'
            value={search}
            onChange={handleSearch}
            loading={loading.toString()}
         />

         {!loading && combinedList.length > 0 && (
            <WrapperUserList>
               {combinedList.map((item) => (
                  <StyledUser
                     key={item.uid || item.id}
                     onClick={() =>
                        handleChat(item.uid || item.id, item.type === 'user')
                     }
                  >
                     <Avatar size={40} src={item.photoURL} alt='Error' />
                     {item.label}
                  </StyledUser>
               ))}
            </WrapperUserList>
         )}
      </WrapperStyled>
   );
}

const WrapperStyled = styled.div`
   display: flex;
   flex-wrap: wrap;
   padding: 0.4rem 1.2rem;
   border-bottom: 1px solid #eee;
   align-items: center;
   position: relative;
   justify-content: space-between;

   .username {
      color: var(--color-black);
      margin-left: 5px;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: 600;
      font-size: 16px;
   }
`;

const UserInfoStyled = styled.div`
   padding: 0rem 0.5rem;
   display: flex;
   flex-wrap: wrap;
   justify-content: center;
`;

const InputStyled = styled(Input)`
   border-radius: 50px;
   margin: 8px 0;
`;

const StyledLogoutIcon = styled(LogoutOutlined)`
   color: #ff1b1b;
   font-size: 16px !important;
`;

const StyledPlusIcon = styled(PlusOutlined)`
   color: #00b9f5;
   font-size: 16px !important;
`;

const StyledMenuItem = styled.span`
   font-size: 14px !important;
   font-weight: 600 !important;
`;

const StyledUser = styled.div`
   display: flex;
   align-items: center;
   width: 100%;
   margin: 8px 0;
   padding: 4px 12px;
   height: 60px;
   background-color: #f9f9f9;
   border: 1px solid #e0e0e0;
   border-radius: 12px;
   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
   color: #333;
   font-size: 16px;
   font-weight: 500;

   > .ant-avatar {
      margin-right: 10px;
   }

   &:hover {
      background-color: #f0f0f0;
      cursor: pointer;
   }
`;

const WrapperUserList = styled.div`
   width: 100%;
   max-height: 220px;
   overflow-y: auto;
`;
