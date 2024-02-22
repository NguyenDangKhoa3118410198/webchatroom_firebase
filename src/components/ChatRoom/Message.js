import { Avatar, Typography } from 'antd';
import { formatRelative } from 'date-fns';
import React from 'react';
import styled from 'styled-components';

const WrapperStyled = styled.div`
   display: flex;
   flex-direction: column;
   align-items: ${(props) => (props.$author ? 'flex-end' : 'flex-start')};
   margin-bottom: 12px;
   font-size: 20px;
   font-weight: 400;

   .ant-typography {
      font-size: 15px;
      color: ${(props) => (props.$author ? 'white' : 'black')};
   }

   .author {
      margin-left: 5px;
      font-weight: bold;
      color: black;
   }

   .date {
      margin-left: 10px;
      font-size: 12px;
      color: #a7a7a7;
   }

   .content {
      margin-left: 30px;
   }

   .wrapper-message {
      width: fit-content;
      display: flex;
      flex-direction: ${(props) => (props.$author ? 'row-reverse' : 'row')};
      margin-right: ${(props) => (props.$author ? '1rem' : '8rem')};
      margin-left: ${(props) => (props.$author ? '8rem' : '1rem')};
      background-color: ${(props) => (props.$author ? '#4D90FE' : '#f0f0f0')};
      border-radius: 5px;
      padding: 10px;
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
      flex-direction: ${(props) => (props.$author ? 'row-reverse' : 'row')};
      margin-bottom: 4px;
      justify-content: center;
      align-items: center;
   }

   .author-info {
      display: flex;
      flex-direction: ${(props) => (props.$author ? 'row-reverse' : 'row')};
      margin-right: ${(props) => (props.$author ? '8px' : '0px')};

      .date {
         color: ${(props) => (props.$author ? 'white' : '')};
      }
   }

   .message {
      text-align: justify;

      .ant-typography {
         font-size: 14px;
         color: ${(props) => (props.$author ? 'white' : 'black')};
      }
   }
`;

function formartDate(seconds) {
   let fortmattedDate = '';

   if (seconds) {
      fortmattedDate = formatRelative(new Date(seconds * 1000), new Date());
      fortmattedDate =
         fortmattedDate.charAt(0).toUpperCase() + fortmattedDate.slice(1);
   }
   return fortmattedDate;
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
         <div className='wrapper-message'>
            <div className='format-message'>
               <div className='wrapper-info'>
                  <Avatar size='default' src={photoURL}>
                     {photoURL ? '' : displayName.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <div className='author-info'>
                     <Typography.Text className='author'>
                        {displayName}
                     </Typography.Text>
                     <Typography.Text className='date'>
                        {formartDate(createAt?.seconds)}
                     </Typography.Text>
                  </div>
               </div>
               <div className='message'>
                  <Typography.Text>{text}</Typography.Text>
               </div>
            </div>
         </div>
      </WrapperStyled>
   );
}
