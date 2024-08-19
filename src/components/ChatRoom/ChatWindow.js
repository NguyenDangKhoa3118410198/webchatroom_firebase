import { UserAddOutlined } from '@ant-design/icons';
import { Avatar, Button, Tooltip, Form, Input, Alert } from 'antd';
import React, { useContext, useState, useMemo, useRef } from 'react';
import styled from 'styled-components';
import Message from './Message';
import { AppContext } from '../Context/AppProvider';
import { addDocument } from '../firebase/services';
import { AuthContext } from '../Context/AuthProvider';
import useFirestore from '../../hooks/useFirestore';

export default function ChatWindow() {
   const { selectedRoom, members, setIsInviteMemberVisible } =
      useContext(AppContext);
   const { uid, photoURL, displayName } = useContext(AuthContext);
   const [inputValue, setInputValue] = useState('');
   const [form] = Form.useForm();
   const messagesEndRef = useRef(null);

   const scrollToBottom = () => {
      if (messagesEndRef.current) {
         messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
   };

   const conditionMessage = useMemo(
      () => ({
         fieldName: 'roomId',
         operator: '==',
         compareValue: selectedRoom.id,
      }),
      [selectedRoom.id]
   );

   const messages = useFirestore('messages', conditionMessage);

   if (!selectedRoom) {
      return null;
   }

   const handleInputChange = (e) => {
      setInputValue(e.target.value);
   };

   const handleOnSubmit = () => {
      addDocument(
         {
            text: inputValue,
            uid,
            photoURL,
            roomId: selectedRoom.id,
            displayName,
         },
         'messages'
      );
      form.resetFields(['message']);
   };

   function formatDate(seconds) {
      if (!seconds) return '';

      const date = new Date(seconds * 1000);
      return date.toISOString().split('T')[0];
   }

   let lastDate = '';

   return (
      <WrapperStyled>
         {selectedRoom.id ? (
            <>
               <HeaderStyled>
                  <div className='header__info'>
                     <p className='header__title'>{selectedRoom.name}</p>
                     <span className='header__description'>
                        {selectedRoom.description}
                     </span>
                  </div>
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
                        style={{ flex: 1, marginBottom: 0 }}
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
         ) : (
            <Alert
               message='Please choose a room.'
               type='info'
               showIcon
               closable
               style={{ margin: '10px' }}
            />
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
   height: calc(96vh - 88px);
   display: flex;
   flex-direction: column;
   margin: 5px 10px;
   justify-content: flex-end;
`;

const FormStyled = styled(Form)`
   display: flex;
   align-items: center;
   width: 100%;
`;

const InputStyled = styled(Input)`
   flex: 1;
   margin-right: 8px;
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
