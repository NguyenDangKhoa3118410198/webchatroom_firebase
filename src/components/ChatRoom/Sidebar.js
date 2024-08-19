import React from 'react';
import UserInfo from './UserInfo';
import RoomList from './RoomList';
import styled from 'styled-components';

const SidebarStyled = styled.div`
   flex: 1;
   background: #fff;
   overflow-y: auto;
   margin: 20px 5px 20px 10px;
   border-radius: 12px;
   box-shadow: rgba(52, 72, 84, 0.05) 0px 0px 8px 0px;
   height: calc(100vh - 40px);
   display: flex;
   flex-direction: column;

   :where(.css-dev-only-do-not-override-17sses9).ant-collapse
      > .ant-collapse-item
      > .ant-collapse-header {
      color: #000;
   }
`;

export default function Sidebar() {
   return (
      <SidebarStyled>
         <UserInfo />
         <RoomList />
      </SidebarStyled>
   );
}
