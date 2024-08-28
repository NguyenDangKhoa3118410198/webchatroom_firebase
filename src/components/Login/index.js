import React from 'react';
import { Row, Col, Button, Typography } from 'antd';
import { signInAnonymously, signInWithPopup } from 'firebase/auth';
import { auth, fbProvider, googleProvider } from '../firebase/config';
import {
   FacebookOutlined,
   GoogleOutlined,
   UserOutlined,
} from '@ant-design/icons';
import {
   checkExistsEmmailAndAddDocument,
   generateKeywords,
} from '../firebase/services';
import styled from 'styled-components';

const { Title } = Typography;

const LoginContainer = styled.div`
   min-width: 400px;
   height: 100%;
   background-color: #27262c;

   @media (max-width: 768px) {
      padding: 20px;
      min-width: 100%;
   }
`;

const RowStyled = styled(Row)`
   display: flex;
   justify-content: center;
   align-items: center;
   width: 100%;
   height: 100vh;
`;

const ColStyled = styled(Col)`
   background-color: #ffffff;
   padding: 40px;
   border-radius: 8px;
   box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

   @media (max-width: 768px) {
      padding: 20px;
      min-width: 90%;
   }
`;

const TitleStyled = styled(Title)`
   text-transform: uppercase;
   text-align: center;
   font-weight: 600;
   color: #1890ff;
   font-size: 32px;
`;

const ButtonStyled = styled(Button)`
   margin: 10px 0;
   width: 100%;
   padding: 28px 20px;
   display: flex;
   justify-content: center;
   align-items: center;
   font-size: 16px;
   font-weight: 600;

   &.facebook-button {
      background-color: #3b5998;
      color: #ffffff;
      border: none;

      .anticon {
         color: #ffffff; /* Đặt màu cho biểu tượng Facebook */
      }
   }

   &.google-button {
      background-color: #ffffff;
      color: #000000;
      border: 1px solid #dcdcdc;

      .anticon {
         color: #4285f4; /* Màu cho biểu tượng Google */
      }
   }

   &.anonymous-button {
      background-color: #ffffff;
      color: #000000;
      border: 1px solid #dcdcdc;

      .anticon {
         color: #000000; /* Màu cho biểu tượng Anonymous */
      }
   }
`;

export default function Login() {
   const handleFbLogin = async () => {
      try {
         const { user } = await signInWithPopup(auth, fbProvider);

         await checkExistsEmmailAndAddDocument(
            {
               displayName: user.displayName,
               email: user.email,
               photoURL: user.photoURL,
               uid: user.uid,
               providerId: user.providerData[0].providerId,
               keywords: generateKeywords(user.displayName),
            },
            'users'
         );
      } catch (error) {
         console.error('Error during Facebook login:', error);
      }
   };

   const handleGoogleLogin = async () => {
      try {
         const { user } = await signInWithPopup(auth, googleProvider);

         await checkExistsEmmailAndAddDocument(
            {
               displayName: user.displayName,
               email: user.email,
               photoURL: user.photoURL,
               uid: user.uid,
               providerId: user.providerData[0].providerId,
               keywords: generateKeywords(user.displayName),
            },
            'users'
         );
      } catch (error) {
         console.error('Error during Google login:', error);
      }
   };

   const handleAnonymousLogin = async () => {
      try {
         const { user } = await signInAnonymously(auth);
         console.log('Anonymous user:', user);
      } catch (error) {
         console.error('Error during anonymous login:', error);
      }
   };

   return (
      <LoginContainer>
         <RowStyled>
            <ColStyled span={8}>
               <TitleStyled level={1}>Chat room</TitleStyled>
               <ButtonStyled
                  className='facebook-button'
                  icon={<FacebookOutlined />}
                  onClick={handleFbLogin}
               >
                  Facebook
               </ButtonStyled>
               <ButtonStyled
                  className='google-button'
                  icon={<GoogleOutlined />}
                  onClick={handleGoogleLogin}
               >
                  Google
               </ButtonStyled>
               <ButtonStyled
                  className='anonymous-button'
                  icon={<UserOutlined />}
                  onClick={handleAnonymousLogin}
               >
                  Anonymous
               </ButtonStyled>
            </ColStyled>
         </RowStyled>
      </LoginContainer>
   );
}
