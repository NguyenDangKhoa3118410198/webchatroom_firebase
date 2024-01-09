import { Avatar, Typography } from 'antd';
import { formatRelative } from 'date-fns';
import React from 'react';
import styled from 'styled-components';

const WrapperStyled = styled.div`
   margin-bottom: 10px;

   .author {
      margin-left: 5px;
      font-weight: bold;
   }

   .date {
      margin-left: 10px;
      font-size: 12px;
      color: #a7a7a7;
   }

   .content {
      margin-left: 30px;
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

export default function Message({ text, displayName, createAt, photoURL }) {
   return (
      <WrapperStyled>
         <div>
            <Avatar size='small' src={photoURL}>
               {photoURL ? '' : displayName.charAt(0)?.toUpperCase()}
            </Avatar>
            <Typography.Text className='author'>{displayName}</Typography.Text>
            <Typography.Text className='date'>
               {formartDate(createAt?.seconds)}
            </Typography.Text>
         </div>
         <div>
            <Typography.Text>{text}</Typography.Text>
         </div>
      </WrapperStyled>
   );
}
