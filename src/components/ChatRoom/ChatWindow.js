import { UserAddOutlined } from '@ant-design/icons';
import { Avatar, Button, Tooltip, Form, Input } from 'antd';
import React, { useContext, useState, useMemo, useRef } from 'react';
import styled from 'styled-components';
import Message from './Message';
import { AppContext } from '../Context/AppProvider';
import { addDocument } from '../firebase/services';
import { AuthContext } from '../Context/AuthProvider';
import useFirestore from '../../hooks/useFirestore';

export default function ChatWindow() {
   const {
      selectedRoom,
      selectedRoomPrivate,
      members,
      setIsInviteMemberVisible,
   } = useContext(AppContext);
   const { uid, photoURL, displayName } = useContext(AuthContext);
   const [inputValue, setInputValue] = useState('');
   const [form] = Form.useForm();
   const messagesEndRef = useRef(null);

   const scrollToBottom = () => {
      if (messagesEndRef.current) {
         messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
   };

   const conditionMessage = useMemo(() => {
      if (selectedRoom.id) {
         return {
            fieldName: 'roomId',
            operator: '==',
            compareValue: selectedRoom.id,
         };
      }
      if (selectedRoomPrivate.id) {
         return {
            fieldName: 'roomId',
            operator: '==',
            compareValue: selectedRoomPrivate.id,
         };
      }
      return null;
   }, [selectedRoom.id, selectedRoomPrivate.id]);

   const messages = useFirestore('messages', conditionMessage);

   const handleInputChange = (e) => {
      setInputValue(e.target.value);
   };

   const handleOnSubmit = () => {
      if (selectedRoom.id || selectedRoomPrivate.id) {
         addDocument(
            {
               text: inputValue,
               uid,
               photoURL,
               roomId: selectedRoom.id || selectedRoomPrivate.id,
               displayName,
            },
            'messages'
         );
         form.resetFields(['message']);
      }
   };

   function formatDate(seconds) {
      if (!seconds) return '';

      const date = new Date(seconds * 1000);
      return date.toISOString().split('T')[0];
   }

   let lastDate = '';

   return (
      <WrapperStyled>
         {(selectedRoom.id || selectedRoomPrivate.id) && (
            <>
               <HeaderStyled>
                  <div className='header__info'>
                     <p className='header__title'>
                        {selectedRoom.id
                           ? selectedRoom.name
                           : selectedRoomPrivate.name}
                     </p>
                     <span className='header__description'>
                        {selectedRoom.id ? selectedRoom.description : ''}
                     </span>
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
                              <Tooltip
                                 title={member.displayName}
                                 key={member.uid}
                              >
                                 <Avatar src={member.photoURL}>
                                    {member.photoURL
                                       ? ''
                                       : member.displayName
                                            ?.charAt(0)
                                            ?.toUpperCase()}
                                 </Avatar>
                              </Tooltip>
                           ))}
                        </Avatar.Group>
                     </ButtonGroupStyled>
                  )}
               </HeaderStyled>
               <ContentStyled>
                  <MessageListStyled>
                     {messages.map((message) => {
                        const messageDate = formatDate(
                           message?.createdAt?.seconds
                        );
                        const showDivider =
                           messageDate !== lastDate && lastDate !== '';

                        lastDate = messageDate;

                        return (
                           <React.Fragment key={message.id}>
                              {showDivider && (
                                 <DividerStyled>{messageDate}</DividerStyled>
                              )}
                              <Message
                                 text={message.text}
                                 photoURL={message.photoURL}
                                 displayName={message.displayName}
                                 createAt={message.createdAt}
                                 author={message.uid === uid}
                                 id={message.id}
                              />
                           </React.Fragment>
                        );
                     })}
                     <div ref={messagesEndRef} />
                     {scrollToBottom()}
                  </MessageListStyled>
                  <FormStyled form={form}>
                     <Form.Item
                        name='message'
                        style={{ flex: 1, margin: '0 5px' }}
                     >
                        <InputStyled
                           placeholder='Enter something...'
                           autoComplete='off'
                           onChange={handleInputChange}
                           onPressEnter={handleOnSubmit}
                        />
                     </Form.Item>
                     <Button type='primary' onClick={handleOnSubmit}>
                        Send
                     </Button>
                  </FormStyled>
               </ContentStyled>
            </>
         )}
      </WrapperStyled>
   );
}

const WrapperStyled = styled.div`
   margin: 20px 10px 20px 10px;
   border-radius: 12px;
   box-shadow: rgba(52, 72, 84, 0.05) 0px 0px 8px 0px;
   background-color: #fff;
   height: calc(100vh - 40px);
   flex: 2;
`;

const HeaderStyled = styled.div`
   display: flex;
   justify-content: space-between;
   height: 58px;
   padding: 0 16px;
   align-items: center;

   .header {
      &__info {
         display: flex;
         flex-direction: column;
         justify-content: center;
         font-size: 16px;
      }

      &__title {
         margin: 0;
         font-weight: bold;
      }

      &__description {
         font-size: 12px;
      }
   }
`;

const ButtonGroupStyled = styled.div`
   display: flex;
   align-items: center;
`;

const ContentStyled = styled.div`
   height: calc(96vh - 75px);
   display: flex;
   flex-direction: column;
   margin: 5px 10px;
   justify-content: flex-end;
`;

const FormStyled = styled(Form)`
   display: flex;
   align-items: center;
   width: 100%;
   padding: 10px 15px;
`;

const InputStyled = styled(Input)`
   flex: 1;
   margin-right: 8px;
   border-radius: 20px;
   height: 36px;
`;

const MessageListStyled = styled.div`
   overflow-y: auto;
`;

const WrapperButtonInvite = styled.div`
   margin: 0 4px;
`;

const DividerStyled = styled.div`
   margin: 20px 0;
   text-align: center;
   color: #999;
   font-size: 14px;
   position: relative;

   &::before,
   &::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 45%;
      height: 1px;
      background-color: #ccc;
   }

   &::before {
      left: 0;
   }

   &::after {
      right: 0;
   }
`;
