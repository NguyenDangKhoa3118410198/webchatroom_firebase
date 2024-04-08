import React, { useContext } from 'react';
import { Button, Collapse, Typography } from 'antd';
import { PlusSquareOutlined } from '@ant-design/icons';
import { AppContext } from '../Context/AppProvider';
import styled from 'styled-components';

const { Panel } = Collapse;

const PanelStyled = styled.div`
   padding: 1rem;
   p {
      color: white;
   }

   .ant-collapse-content-box {
      padding: 0 1rem;
   }

   .add-room {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;

      &.ant-btn:hover {
         border-color: #fff;
      }
   }
`;

// const PanelStyled = styled.div`
//    &&& {
//       .ant-collapse-header,
//       p {
//          color: white;
//       }

//       .ant-collapse-content-box {
//          padding: 0 1rem;
//       }

//       .add-room {
//          position: relative;
//          display: flex;
//          justify-content: center;
//          align-items: center;
//          color: white;

//          &.ant-btn:hover {
//             border-color: #fff;
//          }
//       }
//    }
// `;

const LinkStyled = styled(Typography.Link)`
   display: inline-block;
   margin-bottom: 8px;
   width: 100%;
   border-radius: 10px;
   padding: 6px;
   text-align: left;
   font-size: 15px;
   font-weight: 500;
   cursor: pointer;
   background-color: transparent;

   &:active,
   &.active {
      background-color: #fff;
      color: #4d90fe !important;
   }

   &:hover {
      background-color: #fff;
      opacity: 0.5;
      transition: background-color 0.5s ease-in-out;
   }

   &.ant-typography {
      color: #fff;

      &:hover {
         color: #ccc;
      }
   }
`;

const ButtonAddRoomStyled = styled(Button)`
   width: 100%;
   margin: 10px 0;
`;

export default function RoomList() {
   const { rooms, setAddRoomVisible, setSelectedRoomId, selectedRoomId } =
      useContext(AppContext);

   const handleAddRoom = () => {
      setAddRoomVisible(true);
   };

   return (
      // <Collapse ghost defaultActiveKey={['1']}>
      // <PanelStyled header='List room' key='1'>
      <PanelStyled>
         {rooms.map((room) => (
            <LinkStyled
               key={room.id}
               onClick={() => setSelectedRoomId(room.id)}
               className={selectedRoomId === room.id ? 'active' : ''}
            >
               {room.name}
            </LinkStyled>
         ))}
         <ButtonAddRoomStyled
            type='primary'
            className='add-room'
            icon={<PlusSquareOutlined />}
            onClick={handleAddRoom}
         >
            Add room
         </ButtonAddRoomStyled>
      </PanelStyled>
      // </PanelStyled>
      // </Collapse>
   );
}
