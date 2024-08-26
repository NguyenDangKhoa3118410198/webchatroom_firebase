import React, { useContext, useState } from 'react';
import { AuthContext } from './AuthProvider';
import useFirestore from '../../hooks/useFirestore';

export const AppContext = React.createContext();

export default function AppProvider({ children }) {
   const [isAddRoomVisible, setAddRoomVisible] = useState(false);
   const [isInviteMemberVisible, setIsInviteMemberVisible] = useState(false);

   const [selectedRoomId, setSelectedRoomId] = useState('');
   const [activeItem, setActiveItem] = useState(false);

   // { rooms
   //    name: 'room name'
   //    description: 'mo ta '
   //    members: [uid1, uid2, ...]
   // }
   const { uid } = useContext(AuthContext);

   const roomsConditon = React.useMemo(() => {
      return {
         fieldName: 'members',
         operator: 'array-contains',
         compareValue: uid,
      };
   }, [uid]);

   const rooms = useFirestore('rooms', roomsConditon, 'desc');

   const roomPrivateConditon = React.useMemo(() => {
      return {
         fieldName: 'members',
         operator: 'array-contains',
         compareValue: uid,
      };
   }, [uid]);

   const roomPrivate = useFirestore(
      'privateChats',
      roomPrivateConditon,
      'desc'
   );

   const selectedRoom = React.useMemo(
      () => rooms.find((room) => room.id === selectedRoomId) || {},
      [rooms, selectedRoomId]
   );

   const selectedRoomPrivate = React.useMemo(
      () => roomPrivate.find((item) => item.id === selectedRoomId) || {},
      [roomPrivate, selectedRoomId]
   );

   const usersConditon = React.useMemo(() => {
      return {
         fieldName: 'uid',
         operator: 'in',
         compareValue: selectedRoom.members,
      };
   }, [selectedRoom.members]);

   const userPrivateConditon = React.useMemo(() => {
      return {
         fieldName: 'uid',
         operator: 'in',
         compareValue: selectedRoomPrivate.members,
      };
   }, [selectedRoomPrivate]);

   const members = useFirestore('users', usersConditon);
   const memberPrivate = useFirestore('users', userPrivateConditon);

   return (
      <AppContext.Provider
         value={{
            rooms,
            roomPrivate,
            selectedRoom,
            selectedRoomPrivate,
            members,
            memberPrivate,
            isAddRoomVisible,
            setAddRoomVisible,
            selectedRoomId,
            setSelectedRoomId,
            isInviteMemberVisible,
            setIsInviteMemberVisible,
            activeItem,
            setActiveItem,
         }}
      >
         {children}
      </AppContext.Provider>
   );
}
