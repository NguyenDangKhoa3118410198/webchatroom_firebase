import React from 'react';
import { Row, Col, Button, Typography } from 'antd';
import { signInWithPopup } from 'firebase/auth';
import { auth, fbProvider, googleProvider } from '../firebase/config';
import { FacebookOutlined, GoogleOutlined } from '@ant-design/icons';
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
`;

const RowStyled = styled(Row)`
   display: flex;
   justify-content: center;
   align-items: center;
   width: 100%;
   height: 500px;
`;

const TitleStyled = styled(Title)`
   text-transform: uppercase;
   text-align: center;

   &.ant-typography {
      font-weight: 600;
      color: #eee;
      font-size: 32px;
   }
`;

const ButtonStyled = styled(Button)`
   margin: 10px 0;
   width: 100%;
   background-color: #000;
   color: #fff;
   padding: 20px;
   display: flex;
   justify-content: center;
   align-items: center;
   font-size: 16px;
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
         console.error('Error during Facebook login:', error);
      }
   };

   return (
      <LoginContainer>
         <RowStyled
            justify='center'
            align='middle'
            style={{ height: '100vh', backgroundColor: '#f0f2f5' }}
         >
            <Col
               span={8}
               style={{
                  backgroundColor: '#ffffff',
                  padding: '40px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
               }}
            >
               <TitleStyled
                  level={1}
                  style={{ color: '#1890ff', textAlign: 'center' }}
               >
                  Chat room
               </TitleStyled>
               <ButtonStyled
                  icon={<FacebookOutlined />}
                  onClick={handleFbLogin}
                  style={{
                     width: '100%',
                     marginBottom: '15px',
                     backgroundColor: '#3b5998',
                     color: '#ffffff',
                     border: 'none',
                  }}
               >
                  Login with Facebook
               </ButtonStyled>
               <ButtonStyled
                  icon={<GoogleOutlined />}
                  onClick={handleGoogleLogin}
                  style={{
                     width: '100%',
                     backgroundColor: '#ffffff',
                     color: '#000000',
                     border: '1px solid #dcdcdc',
                  }}
               >
                  Login with Google
               </ButtonStyled>
            </Col>
         </RowStyled>
      </LoginContainer>
   );
}
