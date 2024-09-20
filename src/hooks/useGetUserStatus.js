import { ref, onValue } from 'firebase/database';
import { useState, useEffect } from 'react';
import { rtdb } from '../components/firebase/config';

export default function useGetUserStatus(uid) {
   const [status, setStatus] = useState('offline');
   useEffect(() => {
      if (uid) {
         const userStatusRef = ref(rtdb, `status/${uid}`);

         onValue(userStatusRef, (snapshot) => {
            const statusData = snapshot.val();
            if (statusData) {
               setStatus(statusData.state);
            } else {
               setStatus('offline');
            }
         });
      }
   }, [uid]);

   return status;
}
