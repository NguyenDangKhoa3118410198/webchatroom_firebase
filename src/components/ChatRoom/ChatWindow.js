import { UserAddOutlined } from '@ant-design/icons';
import { Avatar, Button, Tooltip, Form, Input, Alert } from 'antd';
import React, { useContext, useState, useMemo } from 'react';
import styled from 'styled-components';
import Message from './Message';
import { AppContext } from '../Context/AppProvider';
import { addDocument } from '../firebase/services';
import { AuthContext } from '../Context/AuthProvider';
import useFirestore from '../../hooks/useFirestore';

const HeaderStyled = styled.div`
   display: flex;
   justify-content: space-between;
   height: 56px;
   padding: 0 16px;
   align-items: center;
   border-bottom: 1px solid rgba(230, 230, 230);

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

const WrapperStyled = styled.div`
   height: 100vh;
`;

const ContentStyled = styled.div`
   height: calc(96vh - 56px);
   display: flex;
   flex-direction: column;
   padding: 11px;
   justify-content: flex-end;
`;

const FormStyled = styled(Form)`
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 6px 6px 6px 0;
   font-size: 18px;
   border: 1px solid rgba(230, 230, 230);
   border-radius: 2px;

   .ant-form-item {
      flex: 1;
      margin-bottom: 0;
   }
`;

const MessageListStyled = styled.div`
   max-height: 100vh;
   overflow-y: auto;
`;

const WrapperButtonInvite = styled.div`
   margin: 0 4px;
`;

export default function ChatWindow() {
   const { selectedRoom, members, setIsInviteMemberVisible } =
      useContext(AppContext);
   const { uid, photoURL, displayName } = useContext(AuthContext);
   const [inputValue, setInputValue] = useState('');
   const [form] = Form.useForm();

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
                     {messages.map((message) => (
                        <Message
                           key={message.id}
                           text={message.text}
                           photoURL={message.photoURL}
                           displayName={message.displayName}
                           createAt={message.createdAt}
                           author={message.uid === uid}
                        />
                     ))}
                  </MessageListStyled>
                  <FormStyled form={form}>
                     <Form.Item name='message'>
                        <Input
                           placeholder='Enter something...'
                           bordered={false}
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
               style={{ margin: 5 }}
               closable
            />
         )}
      </WrapperStyled>
   );
}
