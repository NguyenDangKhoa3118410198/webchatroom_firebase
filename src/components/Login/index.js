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

const ButtonStyled = styled(Button)`
   width: 100%;
   background-color: #000;
   color: #fff;
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
      <div>
         <Row justify='center' style={{ height: 500 }}>
            <Col span={8}>
               <Title style={{ textAlign: 'center' }} level={3}>
                  Chat room
               </Title>
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
         </Row>
      </div>
   );
}
