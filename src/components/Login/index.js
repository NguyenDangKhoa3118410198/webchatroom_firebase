import React from 'react';
import { Row, Col, Button, Typography } from 'antd';
import { signInWithPopup } from 'firebase/auth';
import { auth, fbProvider } from '../firebase/config';
import {
   checkExistsEmmailAndAddDocument,
   generateKeywords,
} from '../firebase/services';

const { Title } = Typography;

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

   return (
      <div>
         <Row justify='center' style={{ height: 500 }}>
            <Col span={8}>
               <Title style={{ textAlign: 'center' }} level={3}>
                  Chat room
               </Title>
               <Button style={{ width: '100%', marginBottom: 5 }}>
                  Login with Google
               </Button>
               <Button style={{ width: '100%' }} onClick={handleFbLogin}>
                  Login with Facebook
               </Button>
            </Col>
         </Row>
      </div>
   );
}
