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
   padding: 2rem;
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
   font-weight: 900;
   text-transform: uppercase;
   text-align: center;

   &.ant-typography {
      color: #eee;
   }
`;

const ButtonStyled = styled(Button)`
   margin: 1rem 0;
   width: 100%;
   background-color: #000;
   color: #fff;
   padding: 2rem;
   display: flex;
   justify-content: center;
   align-items: center;
   font-size: 1.4rem;
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
         <RowStyled>
            <Col span={8}>
               <TitleStyled level={1}>Chat room</TitleStyled>
               <ButtonStyled
                  icon={<FacebookOutlined />}
                  onClick={handleFbLogin}
               >
                  Login with Facebook
               </ButtonStyled>
               <ButtonStyled
                  icon={<GoogleOutlined />}
                  onClick={handleGoogleLogin}
               >
                  Login with Google
               </ButtonStyled>
            </Col>
         </RowStyled>
      </LoginContainer>
   );
}
