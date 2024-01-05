import { UserAddOutlined } from '@ant-design/icons';
import { Avatar, Button, Tooltip, Form, Input } from 'antd';
import React from 'react';
import styled from 'styled-components';
import Message from './Message';

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

const Formstyled = styled(Form)`
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 2px 2px 2px 0;
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

export default function ChatWindow() {
   return (
      <WrapperStyled>
         <HeaderStyled>
            <div className='header__info'>
               <p className='header__title'>room 1</p>
               <span className='header__description'>Room 1 ne</span>
            </div>
            <ButtonGroupStyled>
               <Button type='text' icon={<UserAddOutlined />}>
                  Add member
               </Button>
               <Avatar.Group size='sm' maxCount={2}>
                  <Tooltip title='A'>
                     <Avatar>A</Avatar>
                  </Tooltip>
                  <Tooltip title='B'>
                     <Avatar>B</Avatar>
                  </Tooltip>
                  <Tooltip title='C'>
                     <Avatar>C</Avatar>
                  </Tooltip>
               </Avatar.Group>
            </ButtonGroupStyled>
         </HeaderStyled>
         <ContentStyled>
            <MessageListStyled>
               <Message
                  text='Test'
                  photoURL={null}
                  displayName='tung'
                  createAt={121312311231}
               />
               <Message
                  text='Test2'
                  photoURL={null}
                  displayName='Nam'
                  createAt={121312311231}
               />
               <Message
                  text='Test1'
                  photoURL={null}
                  displayName='Khoa'
                  createAt={121312311231}
               />
            </MessageListStyled>
            <Formstyled>
               <Form.Item>
                  <Input
                     placeholder='Enter something...'
                     bordered={false}
                     autoComplete='off'
                  />
               </Form.Item>
               <Button type='primary'>Send</Button>
            </Formstyled>
         </ContentStyled>
      </WrapperStyled>
   );
}
