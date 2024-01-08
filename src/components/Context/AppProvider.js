import React, { useContext } from 'react';
import { AuthContext } from './AuthProvider';
import useFirestore from '../../hooks/useFirestore';

export const AppContext = React.createContext();

export default function AppProvider({ children }) {
   const [isAddRoomVisiable, setAddRoomVisiable] = React.useState(false);
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

   return (
      <AppContext.Provider
         value={{ rooms, isAddRoomVisiable, setAddRoomVisiable }}
      >
         {children}
      </AppContext.Provider>
   );
}
