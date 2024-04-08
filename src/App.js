import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import ChatRoom from './components/ChatRoom';
import AuthProvider from './components/Context/AuthProvider';
import AppProvider from './components/Context/AppProvider';
import AddRoomModal from './components/Modals/AddRoomModal';
import InviteMemberModal from './components/Modals/InviteMemberModal';
import Loading from './components/Loading';
import React, { Suspense } from 'react';

function App() {
   return (
      <Router>
         <div className='app-container'>
            <AuthProvider>
               <AppProvider>
                  <Suspense fallback={<Loading />}>
                     <Routes>
                        <Route path='/login' element={<Login />} />
                        <Route path='/' element={<ChatRoom />} />
                     </Routes>
                     <AddRoomModal />
                     <InviteMemberModal />
                  </Suspense>
               </AppProvider>
            </AuthProvider>
         </div>
      </Router>
   );
}

export default App;
