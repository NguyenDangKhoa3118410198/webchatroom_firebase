import { Col, Row } from 'antd';
import React from 'react';
import UserInfo from './UserInfo';
import RoomList from './RoomList';
import styled from 'styled-components';

const SidebarStyled = styled.div`
   background: #6445de;
   height: 100vh;
   overflow-y: auto;

   :where(.css-dev-only-do-not-override-17sses9).ant-collapse
      > .ant-collapse-item
      > .ant-collapse-header {
      color: white;
   }
`;

export default function Sidebar() {
   return (
      <SidebarStyled>
         <Row>
            <Col span={24}>
               <UserInfo />
            </Col>
            <Col span={24}>
               <RoomList />
            </Col>
         </Row>
      </SidebarStyled>
   );
}
