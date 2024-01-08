import React, { useContext } from 'react';
import { Button, Collapse, Typography } from 'antd';
import styled from 'styled-components';
import { PlusSquareOutlined } from '@ant-design/icons';
import useFirestore from '../../hooks/useFirestore';
import { AuthContext } from '../Context/AuthProvider';

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
   // { rooms
   //    name: 'room name'
   //    description: 'mo ta '
   //    members: [uid1, uid2, ...]
   // }
   const { uid } = useContext(AuthContext);

   const roomsConditon = React.useMemo(() => {
      return {
         fieldName: 'members',
         operator: 'array-contains',
         compareValue: uid,
      };
   }, [uid]);

   const rooms = useFirestore('rooms', roomsConditon);

   console.log({ rooms });
   return (
      <Collapse ghost defaultActiveKey={['1']}>
         <PanelStyled header='List room' key='1'>
            {rooms.map((room) => (
               <LinkStyled key={room.id}>{room.name}</LinkStyled>
            ))}
            <Button
               type='text'
               className='add-room'
               icon={<PlusSquareOutlined />}
            >
               Add Room
            </Button>
         </PanelStyled>
      </Collapse>
   );
}
