import { Avatar, Button, Typography } from 'antd';
import { signOut } from 'firebase/auth';
import React from 'react';
import styled from 'styled-components';
import { auth } from '../firebase/config';

import { AuthContext } from '../Context/AuthProvider';

const WrapperStyled = styled.div`
   display: flex;
   flex-wrap: wrap;
   justify-content: space-between;
   padding: 12px 16px;
   border-bottom: 1px solid rgba(82, 38, 83);
   box-shadow: 0 -6px 10px 5px rgba(0, 0, 0, 0.5);
   align-items: center;

   .username {
      color: white;
      margin-left: 5px;
   }
`;

const UserInfoStyled = styled.div`
   padding: 0px 5px;
`;

const ButtonStyled = styled(Button)`
   margin: 4px 0px;

   &.ant-btn:hover {
      border-color: #fff;
   }
`;

export default function UserInfo() {
   const { displayName, photoURL } = React.useContext(AuthContext);
   return (
      <WrapperStyled>
         <UserInfoStyled>
            <Avatar src={photoURL}>
               {photoURL ? '' : displayName?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Typography.Text className='username'>
               {displayName}
            </Typography.Text>
         </UserInfoStyled>
         <ButtonStyled
            type='primary'
            onClick={() => {
               signOut(auth);
            }}
         >
            Logout
         </ButtonStyled>
      </WrapperStyled>
   );
}
