import {
   ArrowLeftOutlined,
   FileOutlined,
   LinkOutlined,
   PictureOutlined,
   UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Image, Tooltip, Typography } from 'antd';
import { orderBy } from 'lodash';
import React, { useState } from 'react';
import styled from 'styled-components';
import { getIconFile } from '../../utils';

export const DetailRoom = ({ setShowDetail, otherMember, messages }) => {
   const [filterItem, setFilterItem] = useState('');

   const { images, files, links } = messages.reduce(
      (acc, message) => {
         const createdAt = message.createdAt
            ? message.createdAt.toDate()
            : new Date();

         if (message.fileURLs && Array.isArray(message.fileURLs)) {
            message.fileURLs.forEach((file) => {
               const fileData = { ...file, createdAt };

               if (file.fileType.startsWith('image')) {
                  acc.images.push(fileData);
               } else if (
                  file.fileType.startsWith('application/') ||
                  file.fileType.startsWith('text/')
               ) {
                  acc.files.push(fileData);
               }
            });
         }

         if (message.text && typeof message.text === 'string') {
            const linksInText = message.text.match(/https?:\/\/[^\s]+/g);
            if (linksInText) {
               linksInText.forEach((url) => {
                  acc.links.push({ url, createdAt });
               });
            }
         }

         return acc;
      },
      { images: [], files: [], links: [] }
   );

   const sortedImages = orderBy(images, ['createdAt'], ['desc']);
   const sortedFiles = orderBy(files, ['createdAt'], ['desc']);
   const sortedLinks = orderBy(links, ['createdAt'], ['desc']);

   console.log(sortedLinks);

   const handleFilterChange = (filter) => {
      setFilterItem(filter);
   };

   return (
      <DetailWrapperStyled>
         <>
            <div className='back-mobile' onClick={() => setShowDetail(false)}>
               <ArrowLeftOutlined />
            </div>
            <div className='detail-wrapper'>
               <div className='detail-header'>
                  {otherMember.length > 1 ? (
                     <Avatar.Group size={40} maxCount={2}>
                        {otherMember.map((member) => (
                           <Tooltip title={member.displayName} key={member.uid}>
                              <Avatar src={member.photoURL} key={member.uid}>
                                 {member.photoURL
                                    ? ''
                                    : member.displayName
                                         ?.charAt(0)
                                         ?.toUpperCase()}
                              </Avatar>
                           </Tooltip>
                        ))}
                     </Avatar.Group>
                  ) : (
                     otherMember.map((member, index) => (
                        <div key={index}>
                           {member?.displayName ? (
                              <Avatar
                                 src={member?.photoURL}
                                 alt='error'
                                 size={55}
                              />
                           ) : (
                              <Avatar
                                 icon={<UserOutlined />}
                                 size={55}
                                 alt='Error'
                              />
                           )}

                           <p className='detail-name'>
                              {member?.displayName ?? 'Anonymous'}
                           </p>
                        </div>
                     ))
                  )}
               </div>
               <div className='detail-content'>
                  <ListImages>
                     <WrapperFilter>
                        <ItemFilter
                           onClick={() => handleFilterChange('images')}
                        >
                           <PictureOutlined />
                           Images
                        </ItemFilter>
                        <ItemFilter onClick={() => handleFilterChange('files')}>
                           <FileOutlined />
                           Files
                        </ItemFilter>
                        <ItemFilter onClick={() => handleFilterChange('links')}>
                           <LinkOutlined />
                           Link
                        </ItemFilter>
                     </WrapperFilter>

                     {filterItem === 'images' && sortedImages.length > 0 && (
                        <div className='sort-images'>
                           {sortedImages.map((item, index) => (
                              <Image
                                 key={index}
                                 src={item.downloadURL}
                                 alt='error'
                                 className='image'
                              />
                           ))}
                        </div>
                     )}

                     {filterItem === 'files' && sortedFiles.length > 0 && (
                        <div style={{ height: '500px', overflow: 'auto' }}>
                           {sortedFiles.map((item) => (
                              <FileLink
                                 href={item.downloadURL}
                                 download={item.fileName}
                                 target='_blank'
                                 rel='noopener noreferrer'
                              >
                                 {getIconFile(item.fileType)}
                                 <span className='file-name'>
                                    {item.fileName}
                                 </span>
                              </FileLink>
                           ))}
                        </div>
                     )}

                     {filterItem === 'links' && sortedLinks.length > 0 && (
                        <div style={{ height: '500px', overflow: 'auto' }}>
                           {sortedLinks.map((item, index) => (
                              <ItemLink
                                 key={index}
                                 className='text-hyperlink'
                                 href={item.url}
                                 target='_blank'
                                 rel='noopener noreferrer'
                              >
                                 <Typography.Text>{item.url}</Typography.Text>
                              </ItemLink>
                           ))}
                        </div>
                     )}
                  </ListImages>
               </div>
            </div>
         </>
      </DetailWrapperStyled>
   );
};

const DetailWrapperStyled = styled.div`
   margin: 20px 10px;
   padding: 12px;
   border-radius: 12px;
   box-shadow: rgba(52, 72, 84, 0.05) 0px 0px 8px 0px;
   background-color: #fff;
   height: calc(100vh - 40px);
   flex: 1;
   overflow: hidden;

   .back-mobile {
      display: none;
      margin: 20px 10px;
   }

   .time-created-at {
      text-align: center;
   }

   .detail-wrapper {
      display: flex;
      justify-content: center;
      flex-direction: column;
   }

   .detail-header {
      margin: 20px 0;
      text-align: center;
   }

   .detail-name {
      font-size: 24px;
      font-weight: 600;
      text-align: center;
      margin: 5px;
   }

   @media (max-width: 425px) {
      flex: 1;

      .back-mobile {
         display: block;
      }
   }
`;

const ListImages = styled.div`
   display: block;
   padding: 4px;
   margin: 4px;
   border-radius: 20px;

   .sort-images {
      height: 500px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      grid-auto-rows: 100px;
      gap: 12px;
      justify-items: center;
      align-items: center;
      overflow-y: auto;
      margin: 14px;
   }

   .image {
      width: 100%;
      height: auto;
      object-fit: cover;
   }
`;

const WrapperFilter = styled.div`
   display: flex;
   gap: 4px;
   justify-content: flex-start;
   padding: 4px;
   overflow-x: auto;
   overflow-y: hidden;
   cursor: grab;

   &::-webkit-scrollbar {
      display: none;
   }

   scrollbar-width: auto;
   -ms-overflow-style: auto;
`;

const ItemFilter = styled(Button)`
   border-radius: 40px;
   padding: 4px 8px;
   margin: 5px 8px;
   border: 1px solid #f0f2f7;
   font-weight: 500;
   font-size: 14px;
   display: flex;
   align-items: center;
   cursor: pointer;
   background-color: #fff;
   color: #a3cbf8;
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

const ItemLink = styled.a`
   margin: 8px;
   padding: 15px;
   border-radius: 14px;
   display: inline-block;
   background-color: #f0f0f0;
`;

export default DetailRoom;
