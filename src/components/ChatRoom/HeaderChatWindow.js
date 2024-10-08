import {
   ArrowLeftOutlined,
   EllipsisOutlined,
   UserAddOutlined,
   UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Tooltip } from 'antd';
import React from 'react';
import styled from 'styled-components';
import useGetUserStatus from '../../hooks/useGetUserStatus';
import { CustomBadge } from './Badge';

export const HeaderChatWindow = ({
   otherMember,
   selectedRoomPrivate,
   selectedRoom,
   members,
   setIsInviteMemberVisible,
   setActiveItem,
   setShowDetail,
}) => {
   const status = useGetUserStatus(otherMember[0]?.uid);
   return (
      <HeaderStyled>
         <div className='back-mobile' onClick={() => setActiveItem(false)}>
            <ArrowLeftOutlined />
         </div>
         <div className='header__info'>
            {selectedRoomPrivate.id && (
               <HeaderContent>
                  <div className='header__wrapper'>
                     <CustomBadge status={status} size={25}>
                        {otherMember.map((member, index) => (
                           <div key={index}>
                              {member?.displayName ? (
                                 <Avatar
                                    src={member?.photoURL}
                                    alt='error'
                                    size={34}
                                 />
                              ) : (
                                 <Avatar
                                    icon={<UserOutlined />}
                                    size={34}
                                    alt='Error'
                                 />
                              )}

                              <span className='header__title'>
                                 {member?.displayName ?? 'Anonymous'}
                              </span>
                           </div>
                        ))}
                     </CustomBadge>
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
               <HeaderContent>
                  <p className='header__title'> {selectedRoom.name}</p>
                  <span className='header__description'>
                     {selectedRoom?.description}
                  </span>
                  <div
                     className='header-detail'
                     onClick={() => setShowDetail((prevState) => !prevState)}
                  >
                     <EllipsisOutlined style={{ fontSize: '24px' }} />
                  </div>
               </HeaderContent>
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
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      margin-left: auto;
      cursor: pointer;

      &:hover {
         background-color: #f0f0f0;
      }
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
         margin-top: 4px;
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
