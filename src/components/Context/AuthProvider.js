import React from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

export const AuthContext = React.createContext();

export default function AuthProvider({ children }) {
   const [user, setUser] = React.useState({});
   const navigate = useNavigate();

   React.useEffect(() => {
      const unsubscribed = onAuthStateChanged(auth, (user) => {
         if (user) {
            const { displayName, email, uid, photoURL } = user;
            setUser({ displayName, email, uid, photoURL });
            console.log(user);
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
