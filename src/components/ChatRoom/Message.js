import { Image, Menu, Typography } from 'antd';
import React, { useCallback } from 'react';
import styled from 'styled-components';
import { db } from '../firebase/config';
import { deleteDoc, doc } from 'firebase/firestore';

import FormatMessage from './FormatMessage';
import { getIconFile } from '../../utils';

export default function Message({
   text,
   displayName,
   createAt,
   photoURL,
   author,
   id,
   fileURLs,
}) {
   const handleDeleteMessage = async (id) => {
      try {
         await deleteDoc(doc(db, 'messages', id));
         console.log(`Message with ID ${id} deleted successfully.`);
      } catch (error) {
         console.error('Error deleting message:', error);
      }
   };

   const menu = (
      <Menu>
         <Menu.Item key='delete' onClick={() => handleDeleteMessage(id)}>
            Delete
         </Menu.Item>
      </Menu>
   );

   const isValidURL = useCallback((string) => {
      try {
         new URL(string);
         return true;
      } catch (err) {
         return false;
      }
   }, []);

   return (
      <WrapperStyled $author={author} key={id}>
         {text.trim() ? (
            <FormatMessage
               key={id}
               displayName={displayName}
               photoURL={photoURL}
               createAt={createAt}
               menu={menu}
            >
               <div className='message-container'>
                  <div className='wrapper-message'>
                     <div className='format-message'>
                        <div className='message'>
                           {text
                              .split(/(https?:\/\/[^\s]+)/g)
                              .map((part, index) =>
                                 isValidURL(part) ? (
                                    <a
                                       key={index}
                                       className='text-hyperlink'
                                       href={part}
                                       target='_blank'
                                       rel='noopener noreferrer'
                                    >
                                       <Typography.Text>{part}</Typography.Text>
                                    </a>
                                 ) : (
                                    <Typography.Text key={index}>
                                       {part}
                                    </Typography.Text>
                                 )
                              )}
                        </div>
                     </div>
                  </div>
               </div>
            </FormatMessage>
         ) : null}

         {fileURLs &&
            fileURLs.map((file) => {
               const { downloadURL, fileType, fileName } = file;
               const uniqueKey = `${fileName}-${fileType}`;

               if (fileType.startsWith('image/')) {
                  return (
                     <FormatMessage
                        key={uniqueKey}
                        displayName={displayName}
                        photoURL={photoURL}
                        createAt={createAt}
                        menu={menu}
                     >
                        <ImageStyled src={downloadURL} alt='chat-img' />
                     </FormatMessage>
                  );
               } else if (fileType.startsWith('video/')) {
                  return (
                     <FormatMessage
                        key={uniqueKey}
                        displayName={displayName}
                        photoURL={photoURL}
                        createAt={createAt}
                        menu={menu}
                     >
                        <video
                           controls
                           style={{ width: '200px', margin: '10px' }}
                        >
                           <source src={downloadURL} type='video/mp4' />
                           Your browser does not support the video tag.
                        </video>
                     </FormatMessage>
                  );
               } else if (
                  fileType.startsWith('application/') ||
                  fileType.startsWith('text/')
               ) {
                  return (
                     <FormatMessage
                        key={uniqueKey}
                        displayName={displayName}
                        photoURL={photoURL}
                        createAt={createAt}
                        menu={menu}
                     >
                        <FileLink
                           href={downloadURL}
                           download={fileName}
                           target='_blank'
                           rel='noopener noreferrer'
                        >
                           {getIconFile(fileType)}
                           <span className='file-name'>{fileName}</span>
                        </FileLink>
                     </FormatMessage>
                  );
               } else if (fileType.startsWith('audio/')) {
                  return (
                     <FormatMessage
                        key={uniqueKey}
                        displayName={displayName}
                        photoURL={photoURL}
                        createAt={createAt}
                        menu={menu}
                     >
                        <audio controls>
                           <source src={downloadURL} type={fileType} />
                           Your browser does not support the audio element.
                        </audio>
                     </FormatMessage>
                  );
               } else {
                  return (
                     <FormatMessage
                        key={uniqueKey}
                        displayName={displayName}
                        photoURL={photoURL}
                        createAt={createAt}
                        menu={menu}
                     >
                        <p>Unsupported file type: {fileType}</p>
                     </FormatMessage>
                  );
               }
            })}
      </WrapperStyled>
   );
}

const WrapperStyled = styled.div`
   display: flex;
   flex-direction: column;
   align-items: ${(props) => (props.$author ? 'flex-end' : 'flex-start')};
   margin-bottom: 12px;
   font-size: 16px;
   position: relative;

   .message-layout-container {
      display: flex;
      flex-direction: ${(props) => (props.$author ? 'row-reverse' : 'row')};
      max-width: 80%;
      position: relative;
      justify-content: center;
      align-items: center;
      margin-right: 5px;
   }

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
      color: #b0b0b0;
   }

   .message-container {
      position: relative;
      display: flex;
      flex-direction: ${(props) => (props.$author ? 'row-reverse' : 'row')};
      background-color: ${(props) => (props.$author ? '#4D90FE' : '#f0f0f0')};
      border-radius: ${(props) => (props.$author ? '22px' : '22px')};
      padding: 6px 8px;
   }

   .wrapper-message {
      min-width: 20px;
      display: flex;
      flex-direction: ${(props) => (props.$author ? 'row-reverse' : 'row')};
      background-color: ${(props) => (props.$author ? '#4D90FE' : '#f0f0f0')};
      border-radius: ${(props) => (props.$author ? '22px' : '22px')};
      padding: 0 8px;
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
      gap: 5px;
      margin: 0 4px;
      margin-top: auto;
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
      white-space: nowrap;
   }

   .message {
      display: flex;
      flex-direction: column;
      text-align: justify;

      .ant-typography {
         font-size: 14px;
         color: ${(props) => (props.$author ? 'white' : 'black')};
      }
   }

   .more-icon {
      cursor: pointer;
      color: #3c3c3c;
      opacity: 0;
   }

   &:hover .more-icon {
      opacity: 1;
   }

   .text-hyperlink {
      color: ${(props) => (props.$author ? 'white' : 'black')};
   }
`;

const ImageStyled = styled(Image)`
   border-radius: 12px;
   max-width: 200px;
   min-width: 80px;
   margin: 5px 0;
`;

const FileLink = styled.a`
   display: flex;
   align-items: center;
   text-decoration: none;
   color: inherit;
   margin: 5px;
   padding: 15px;
   background-color: #f0f0f0;
   border-radius: 14px;
   gap: 5px;

   .file-name {
      overflow-wrap: break-word;
      word-break: break-word;
   }
`;
