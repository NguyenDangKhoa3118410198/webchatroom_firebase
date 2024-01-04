import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import ChatRoom from './components/ChatRoom';
import AuthProvider from './components/Context/AuthProvider';

function App() {
   return (
      <Router>
         <AuthProvider>
            <Routes>
               <Route path='/login' element={<Login />} />
               <Route path='/' element={<ChatRoom />} />
            </Routes>
         </AuthProvider>
      </Router>
   );
}

export default App;
