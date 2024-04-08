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
   padding: 1rem 1.2rem;
   border-bottom: 1px solid rgba(82, 38, 83);
   box-shadow: 0 -6px 10px 5px rgba(0, 0, 0, 0.5);
   align-items: center;
   gap: 1rem;
   positon: relative;

   .username {
      color: white;
      margin-left: 5px;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
   }
`;

const UserInfoStyled = styled.div`
   padding: 0rem 0.5rem;
   display: flex;
   flex-wrap: wrap;
   justify-content: center;
`;

const ButtonStyled = styled(Button)`
   text-align: center;
   max-width: 120px;
   width: 100%;
   gap: 1rem;
   flex: 1;

   &.ant-btn:hover {
      border-color: #fff;
   }

   &.ant-btn {
      padding: 0.2rem;
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
