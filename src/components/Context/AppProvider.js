import React, { useContext } from 'react';
import { AuthContext } from './AuthProvider';
import useFirestore from '../../hooks/useFirestore';

export const AppContext = React.createContext();

export default function AppProvider({ children }) {
   const [isAddRoomVisiable, setAddRoomVisiable] = React.useState(false);
   const [isInviteMemberVisiable, setIsInviteMemberVisiable] =
      React.useState(false);

   const [selectedRoomId, setSelectedRoomId] = React.useState('');

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

   const rooms = useFirestore('rooms', roomsConditon);

   const selectedRoom = React.useMemo(
      () => rooms.find((room) => room.id === selectedRoomId) || {},
      [rooms, selectedRoomId]
   );

   const usersConditon = React.useMemo(() => {
      return {
         fieldName: 'uid',
         operator: 'in',
         compareValue: selectedRoom.members,
      };
   }, [selectedRoom.members]);

   const members = useFirestore('users', usersConditon);

   return (
      <AppContext.Provider
         value={{
            rooms,
            selectedRoom,
            members,
            isAddRoomVisiable,
            setAddRoomVisiable,
            selectedRoomId,
            setSelectedRoomId,
            isInviteMemberVisiable,
            setIsInviteMemberVisiable,
         }}
      >
         {children}
      </AppContext.Provider>
   );
}
