import { Avatar, Tooltip, Typography } from 'antd';
import React from 'react';
import styled from 'styled-components';

const WrapperStyled = styled.div`
   display: flex;
   flex-direction: column;
   align-items: ${(props) => (props.$author ? 'flex-end' : 'flex-start')};
   margin-bottom: 12px;
   font-size: 20px;
   font-weight: 400;
   font-size: 16px;

   .ant-typography {
      font-size: 15px;
      color: ${(props) => (props.$author ? 'white' : 'black')};
   }

   .author {
      font-weight: bold;
      color: black;
   }

   .date {
      font-size: 11px;
      color: #a7a7a7;
   }

   .content {
      margin-left: 30px;
   }

   .wrapper-message {
      min-width: 150px;
      display: flex;
      flex-direction: ${(props) => (props.$author ? 'row-reverse' : 'row')};
      margin-right: ${(props) => (props.$author ? '1rem' : '8rem')};
      margin-left: ${(props) => (props.$author ? '8rem' : '1rem')};
      background-color: ${(props) => (props.$author ? '#4D90FE' : '#f0f0f0')};
      border-radius: ${(props) => (props.$author ? '8px 16px' : '16px 8px')};
      padding: 0.8rem;
      font-weight: 400;
      overflow: hidden;
   }

   .format-message {
      display: flex;
      flex-direction: column;
      align-items: ${(props) => (props.$author ? 'flex-end' : 'flex-start')};
   }

   .wrapper-info {
      display: flex;
      flex-wrap: wrap;
      flex-direction: ${(props) => (props.$author ? 'row-reverse' : 'row')};
      margin-bottom: 4px;
      gap: 5px;
   }

   .avatar-custom {
      min-width: 30px;
      min-height: 30px;
      width: 30px;
      height: 30px;
   }

   .author-info {
      display: flex;
      flex-direction: ${(props) => (props.$author ? 'row-reverse' : 'row')};
      gap: 5px;
      justify-content: center;
      align-items: center;
   }

   .message-date {
      display: flex;
      align-items: center;
      text-align: center;
   }

   .date {
      color: ${(props) => (props.$author ? 'white' : '')};
   }

   .message {
      text-align: justify;

      .ant-typography {
         font-size: 14px;
         color: ${(props) => (props.$author ? 'white' : 'black')};
      }
   }
`;

function formatTime(seconds) {
   if (!seconds) return '';
   const date = new Date(seconds * 1000);
   const hours = date.getUTCHours().toString().padStart(2, '0');
   const minutes = date.getUTCMinutes().toString().padStart(2, '0');
   return `${hours}:${minutes}`;
}

export default function Message({
   text,
   displayName,
   createAt,
   photoURL,
   author,
}) {
   return (
      <WrapperStyled $author={author}>
         <Tooltip
            color='#fff'
            placement='left'
            title={
               <div className='message-date'>
                  <Typography.Text className='date'>
                     {formatTime(createAt?.seconds)}
                  </Typography.Text>
               </div>
            }
         >
            <div className='wrapper-message'>
               <div className='format-message'>
                  <div className='wrapper-info'>
                     <div className='author-info'>
                        <Avatar
                           size='default'
                           src={photoURL}
                           className='avatar-custom'
                        >
                           {photoURL
                              ? ''
                              : displayName.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Typography.Text className='author'>
                           {displayName}
                        </Typography.Text>
                     </div>
                  </div>
                  <div className='message'>
                     <Typography.Text>{text}</Typography.Text>
                  </div>
               </div>
            </div>
         </Tooltip>
      </WrapperStyled>
   );
}
