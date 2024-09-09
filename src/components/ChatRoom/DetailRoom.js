import {
   ArrowLeftOutlined,
   DownOutlined,
   UpOutlined,
   UserOutlined,
} from '@ant-design/icons';
import { Avatar, Image } from 'antd';
import { orderBy } from 'lodash';
import React, { useState } from 'react';
import styled from 'styled-components';

export const DetailRoom = ({ setShowDetail, otherMember, messages }) => {
   const [showImages, setShowImages] = useState(false);

   const messagesWithFiles = messages.filter((message) => message.fileURLs);

   const listImages = messagesWithFiles.flatMap((message) =>
      message.fileURLs
         .filter((file) => file.fileType.startsWith('image'))
         .map((file) => ({
            ...file,
            createdAt: message.createdAt
               ? message.createdAt.toDate()
               : new Date(),
         }))
   );
   const sortedImages = orderBy(listImages, ['createdAt'], ['desc']);

   return (
      <DetailWrapperStyled>
         <>
            <div className='back-mobile' onClick={() => setShowDetail(false)}>
               <ArrowLeftOutlined />
            </div>
            <div className='detail-wrapper'>
               <div className='detail-header'>
                  {otherMember?.displayName ? (
                     <Avatar
                        src={otherMember?.photoURL}
                        alt='error'
                        size={55}
                     />
                  ) : (
                     <Avatar icon={<UserOutlined />} size={55} alt='Error' />
                  )}

                  <p className='detail-name'>
                     {otherMember?.displayName ?? 'Anonymous'}
                  </p>
               </div>
               <div className='detail-content'>
                  <ListImages>
                     <TitleListImages
                        onClick={() => setShowImages((pre) => !pre)}
                     >
                        <span className='title-list-images'>All images</span>
                        <div
                           style={{
                              marginLeft: 'auto',
                           }}
                        >
                           {showImages ? (
                              <UpOutlined style={{ fontSize: '12px' }} />
                           ) : (
                              <DownOutlined style={{ fontSize: '12px' }} />
                           )}
                        </div>
                     </TitleListImages>

                     {showImages && sortedImages.length > 0 && (
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

const TitleListImages = styled.div`
   display: flex;
   align-items: center;
   margin: 15px 0;
   cursor: pointer;
`;

const ListImages = styled.div`
   display: block;
   padding: 4px;
   margin: 4px;
   border-radius: 20px;

   .title-list-images {
      font-size: 15px;
      font-weight: 600;
      margin-left: 8px;
   }

   .sort-images {
      height: 400px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      grid-auto-rows: 100px;
      gap: 12px;
      justify-items: center;
      align-items: center;
      overflow-y: auto;
   }

   .image {
      width: 100%;
      height: auto;
      object-fit: cover;
   }
`;
