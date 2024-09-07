import {
   ArrowLeftOutlined,
   EllipsisOutlined,
   UserAddOutlined,
   UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Tooltip } from 'antd';
import React from 'react';
import styled from 'styled-components';

export const HeaderChatWindow = ({
   otherMember,
   selectedRoomPrivate,
   selectedRoom,
   members,
   setIsInviteMemberVisible,
   setActiveItem,
   showDetail,
   setShowDetail,
}) => {
   return (
      <HeaderStyled>
         <div className='back-mobile' onClick={() => setActiveItem(false)}>
            <ArrowLeftOutlined />
         </div>
         <div className='header__info'>
            {selectedRoomPrivate.id && (
               <HeaderContent>
                  <div className='header__wrapper'>
                     {otherMember?.displayName ? (
                        <Avatar
                           src={otherMember?.photoURL}
                           alt='error'
                           size={34}
                        />
                     ) : (
                        <Avatar icon={<UserOutlined />} size={34} alt='Error' />
                     )}

                     <span className='header__title'>
                        {otherMember?.displayName ?? 'Anonymous'}
                     </span>
                  </div>
                  <div
                     className='header-detail'
                     onClick={() => setShowDetail((prevState) => !prevState)}
                  >
                     <EllipsisOutlined style={{ fontSize: '24px' }} />
                  </div>
               </HeaderContent>
            )}
            {selectedRoom.id && (
               <>
                  <p className='header__title'> {selectedRoom.name}</p>
                  <span className='header__description'>
                     {selectedRoom?.description}
                  </span>
               </>
            )}
         </div>
         {selectedRoom.id && (
            <ButtonGroupStyled>
               <WrapperButtonInvite>
                  <Button
                     type='text'
                     icon={<UserAddOutlined />}
                     onClick={() => setIsInviteMemberVisible(true)}
                  >
                     Add member
                  </Button>
               </WrapperButtonInvite>
               <Avatar.Group size='sm' maxCount={2}>
                  {members.map((member) => (
                     <Tooltip title={member.displayName} key={member.uid}>
                        <Avatar src={member.photoURL} key={member.uid}>
                           {member.photoURL
                              ? ''
                              : member.displayName?.charAt(0)?.toUpperCase()}
                        </Avatar>
                     </Tooltip>
                  ))}
               </Avatar.Group>
            </ButtonGroupStyled>
         )}
      </HeaderStyled>
   );
};

const HeaderContent = styled.div`
   width: 100%;
   display: flex;

   .header-detail {
      margin-left: auto;
   }
`;

const HeaderStyled = styled.div`
   display: flex;
   justify-content: space-between;
   height: 58px;
   padding: 0 16px;
   align-items: center;
   width: 100%;

   .back-mobile {
      display: none;
   }

   .header {
      &__info {
         display: flex;
         flex-direction: column;
         justify-content: center;
         font-size: 16px;
         width: 100%;
      }

      &__wrapper {
         display: flex;
         align-items: center;
         margin-inline: 18px;
      }

      &__title {
         margin: 0;
         font-weight: 600;
         margin-inline: 5px;
      }

      &__description {
         font-size: 12px;
         margin-inline: 5px;
      }
   }

   @media (max-width: 425px) {
      .back-mobile {
         display: block;
      }
   }
`;

const ButtonGroupStyled = styled.div`
   display: flex;
   align-items: center;
`;

const WrapperButtonInvite = styled.div`
   margin: 0 4px;
`;
