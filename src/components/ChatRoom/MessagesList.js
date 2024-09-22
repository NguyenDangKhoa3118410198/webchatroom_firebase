import React from 'react';
import Message from './Message';
import styled from 'styled-components';
import { formatDate } from '../../utils';

export const MessagesList = ({
   messages,
   uid: currentUid,
   nofityNewMess,
   setNotifyNewMess,
}) => {
   let lastDate = '';

   return (
      <>
         {messages.map((message) => {
            const {
               id,
               text,
               photoURL,
               displayName,
               createdAt,
               fileURLs,
               uid,
               seen,
            } = message;
            const messageDate = formatDate(message?.createdAt?.seconds);
            const showDivider = messageDate !== lastDate && lastDate !== '';

            lastDate = messageDate;
            if (seen && seen[currentUid] === false && !nofityNewMess) {
               setNotifyNewMess(true);
            }

            return (
               <React.Fragment key={id}>
                  {showDivider && (
                     <DividerStyled
                        key={`divider-${id}`}
                        visible={showDivider ? 1 : 0}
                     >
                        {messageDate}
                     </DividerStyled>
                  )}
                  <Message
                     text={text}
                     photoURL={photoURL}
                     displayName={displayName}
                     createAt={createdAt}
                     author={uid === currentUid}
                     id={id}
                     fileURLs={fileURLs || []}
                  />
               </React.Fragment>
            );
         })}
      </>
   );
};

const DividerStyled = styled.div`
   margin: 20px 30px;
   text-align: center;
   color: #999;
   font-size: 14px;
   position: relative;
   opacity: ${(props) => (props.visible ? 1 : 0)};
   transition: opacity 0.3s ease-in-out;

   &::before,
   &::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 42%;
      height: 1px;
      background-color: #ccc;
      transition: opacity 0.3s ease-in-out;
      opacity: ${(props) => (props.visible ? 1 : 0)};
   }

   &::before {
      left: 0;
   }

   &::after {
      right: 0;
   }
`;
