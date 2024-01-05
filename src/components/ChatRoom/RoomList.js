import React from 'react';
import { Button, Collapse, Typography } from 'antd';
import styled from 'styled-components';
import { PlusSquareOutlined } from '@ant-design/icons';

const { Panel } = Collapse;
const PanelStyled = styled(Panel)`
   &&& {
      .ant-collapse-header,
      p {
         color: white;
      }

      .ant-collapse-content-box {
         padding: 0 40px;
      }

      .add-room {
         color: white;
         padding: 0;
      }
   }
`;

const LinkStyled = styled(Typography.Link)`
   display: block;
   margin-bottom: 5px;
   color: white;
`;

export default function RoomList() {
   return (
      <Collapse ghost defaultActiveKey={['1']}>
         <PanelStyled header='List room' key='1'>
            <LinkStyled>room1</LinkStyled>
            <LinkStyled>room2</LinkStyled>
            <LinkStyled>room3</LinkStyled>
            <Button
               type='text'
               className='add-room'
               icon={<PlusSquareOutlined />}
               ghost
            >
               Add Room
            </Button>
         </PanelStyled>
      </Collapse>
   );
}
