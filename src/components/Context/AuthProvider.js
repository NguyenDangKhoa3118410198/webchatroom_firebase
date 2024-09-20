import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { onDisconnect, ref, set } from 'firebase/database';
import { rtdb } from '../firebase/config';

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
   const [user, setUser] = useState({});
   const navigate = useNavigate();

   useEffect(() => {
      const unsubscribed = onAuthStateChanged(auth, (user) => {
         if (user) {
            const { displayName, email, uid, photoURL } = user;
            setUser({ displayName, email, uid, photoURL });

            const userStatusRef = ref(rtdb, `status/${user.uid}`);

            set(userStatusRef, {
               state: 'online',
               last_changed: Date.now(),
            });

            onDisconnect(userStatusRef).set({
               state: 'offline',
               last_changed: Date.now(),
            });

            navigate('/');
            return;
         }
         navigate('/login');
      });

      return () => {
         unsubscribed();
      };
   }, [navigate]);

   return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}
