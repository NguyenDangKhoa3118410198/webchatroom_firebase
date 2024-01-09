import React, { useContext } from 'react';
import { Button, Collapse, Typography } from 'antd';
import { PlusSquareOutlined } from '@ant-design/icons';
import { AppContext } from '../Context/AppProvider';
import styled from 'styled-components';

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
   const { rooms, setAddRoomVisible, setSelectedRoomId } =
      useContext(AppContext);

   const handleAddRoom = () => {
      setAddRoomVisible(true);
   };

   return (
      <Collapse ghost defaultActiveKey={['1']}>
         <PanelStyled header='List room' key='1'>
            {rooms.map((room) => (
               <LinkStyled
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
               >
                  {room.name}
               </LinkStyled>
            ))}
            <Button
               type='text'
               className='add-room'
               icon={<PlusSquareOutlined />}
               onClick={handleAddRoom}
            >
               Add Room
            </Button>
         </PanelStyled>
      </Collapse>
   );
}
