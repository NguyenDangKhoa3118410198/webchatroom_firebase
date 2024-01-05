import { Avatar, Button, Typography } from 'antd';
import { signOut } from 'firebase/auth';
import React from 'react';
import styled from 'styled-components';
import { auth } from '../firebase/config';

const WrapperStyled = styled.div`
   display: flex;
   justify-content: space-between;
   padding: 12px 16px;
   border-bottom: 1px solid rgba(82, 38, 83);

   .username {
      color: white;
      margin-left: 5px;
   }
`;

export default function UserInfo() {
   return (
      <WrapperStyled>
         <div>
            <Avatar>Avatar</Avatar>
            <Typography.Text className='username'>Username</Typography.Text>
         </div>
         <Button
            ghost
            onClick={() => {
               signOut(auth);
            }}
         >
            Logout
         </Button>
      </WrapperStyled>
   );
}