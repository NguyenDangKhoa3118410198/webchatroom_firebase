import { Avatar, Dropdown, Image, Menu, Tooltip, Typography } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { db } from '../firebase/config';
import { deleteDoc, doc } from 'firebase/firestore';
import {
   FilePdfOutlined,
   FileWordOutlined,
   FileExcelOutlined,
   FilePptOutlined,
   FileImageOutlined,
   FileOutlined,
   FileZipOutlined,
   MoreOutlined,
} from '@ant-design/icons';

export default function Message({
   text,
   displayName,
   createAt,
   photoURL,
   author,
   id,
   fileURLs,
}) {
   function formatTime(seconds) {
      if (!seconds) return '';
      const date = new Date(seconds * 1000);
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
   }

   const handleDeleteMessage = async (id) => {
      try {
         await deleteDoc(doc(db, 'messages', id));
         console.log(`Message with ID ${id} deleted successfully.`);
      } catch (error) {
         console.error('Error deleting message:', error);
      }
   };

   const getIconFile = (fileType) => {
      const fileTypeExtension = fileType.split('/')[1] || 'unknown';
      switch (fileTypeExtension) {
         case 'pdf':
            return (
               <FilePdfOutlined
                  style={{ fontSize: '24px', color: '#d32f2f' }}
               />
            );
         case 'msword':
         case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
            return (
               <FileWordOutlined
                  style={{ fontSize: '24px', color: '#1e88e5' }}
               />
            );
         case 'vnd.ms-excel':
         case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
         case 'csv':
            return (
               <FileExcelOutlined
                  style={{ fontSize: '24px', color: '#43a047' }}
               />
            );
         case 'vnd.openxmlformats-officedocument.presentationml.presentation':
            return (
               <FilePptOutlined
                  style={{ fontSize: '24px', color: '#e64a19' }}
               />
            );
         case 'png':
         case 'jpeg':
         case 'jpg':
         case 'gif':
            return (
               <FileImageOutlined
                  style={{ fontSize: '24px', color: '#2196f3' }}
               />
            );
         case 'mp3':
         case 'wav':
            return (
               <FileOutlined style={{ fontSize: '24px', color: '#f57c00' }} />
            ); // Sử dụng icon chung cho âm thanh
         case 'mp4':
         case 'webm':
         case 'ogg':
            return (
               <FileOutlined style={{ fontSize: '24px', color: '#0288d1' }} />
            ); // Sử dụng icon chung cho video
         case 'zip':
         case 'rar':
            return (
               <FileZipOutlined
                  style={{ fontSize: '24px', color: '#7b1fa2' }}
               />
            );
         case 'txt':
            return (
               <FileOutlined style={{ fontSize: '24px', color: '#616161' }} />
            );
         default:
            return (
               <FileOutlined style={{ fontSize: '24px', color: '#616161' }} />
            );
      }
   };

   const menu = (
      <Menu>
         <Menu.Item key='delete' onClick={() => handleDeleteMessage(id)}>
            Delete
         </Menu.Item>
      </Menu>
   );

   return (
      <WrapperStyled $author={author} key={id}>
         {text.trim() ? (
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
               <div className='message-container'>
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
                  <div className='more-options'>
                     <Dropdown
                        overlay={menu}
                        trigger={['click']}
                        placement='top'
                        arrow
                     >
                        <MoreOutlined className='more-icon' color='red' />
                     </Dropdown>
                  </div>
               </div>
            </Tooltip>
         ) : null}
         {fileURLs &&
            fileURLs.map((file) => {
               const { downloadURL, fileType, fileName } = file;
               if (fileType.startsWith('image/')) {
                  return (
                     <div style={{ margin: '5px' }}>
                        <ImageStyled
                           src={downloadURL}
                           alt='chat-img'
                           key={fileName}
                        />
                     </div>
                  );
               } else if (fileType.startsWith('video/')) {
                  return (
                     <video
                        key={id}
                        controls
                        style={{ width: '200px', margin: '10px' }}
                     >
                        <source src={downloadURL} type='video/mp4' />
                        Your browser does not support the video tag.
                     </video>
                  );
               } else if (
                  fileType.startsWith('application/') ||
                  fileType.startsWith('text/')
               ) {
                  return (
                     <FileLink
                        key={fileName}
                        href={downloadURL}
                        download={fileName}
                        target='_blank'
                        rel='noopener noreferrer'
                     >
                        {getIconFile(fileType)}
                        <span className='file-name'>{fileName}</span>
                     </FileLink>
                  );
               } else {
                  return <p key={id}>Unsupported file type: {fileType}</p>;
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

   .message-container {
      position: relative;
      display: flex;
      flex-direction: ${(props) => (props.$author ? 'row-reverse' : 'row')};
      background-color: ${(props) => (props.$author ? '#4D90FE' : '#f0f0f0')};
      border-radius: ${(props) => (props.$author ? '8px 16px' : '16px 8px')};
      padding: 6px 8px;
      margin: ${(props) =>
         props.$author ? '0 0.4rem 0 8rem' : '0 8rem 0 0.4rem'};
   }

   .wrapper-message {
      min-width: 150px;
      display: flex;
      flex-direction: ${(props) => (props.$author ? 'row-reverse' : 'row')};
      background-color: ${(props) => (props.$author ? '#4D90FE' : '#f0f0f0')};
      border-radius: ${(props) => (props.$author ? '8px 16px' : '16px 8px')};
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
      position: absolute;
      top: 12px;
      ${(props) => (props.$author ? 'left: 8px;' : 'right: 8px;')}
      cursor: pointer;
      color: #3c3c3c;
   }

   .more-options {
      position: absolute;
      ${(props) => (props.$author ? 'left: -40%;' : 'right: -40%;')}
      top: 0;
      transform: translateY(-50%);
      z-index: 1;
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
`;
