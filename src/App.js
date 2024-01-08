import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import ChatRoom from './components/ChatRoom';
import AuthProvider from './components/Context/AuthProvider';
import AppProvider from './components/Context/AppProvider';
import AddRoomModal from './components/Modals/AddRoomModal';

function App() {
   return (
      <Router>
         <AuthProvider>
            <AppProvider>
               <Routes>
                  <Route path='/login' element={<Login />} />
                  <Route path='/' element={<ChatRoom />} />
               </Routes>
               <AddRoomModal />
            </AppProvider>
         </AuthProvider>
      </Router>
   );
}

export default App;
