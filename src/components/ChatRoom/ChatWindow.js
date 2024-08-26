import {
   ArrowLeftOutlined,
   PaperClipOutlined,
   UserAddOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Tooltip, Form, Input, message } from 'antd';
import React, { useContext, useState, useMemo, useRef } from 'react';
import styled from 'styled-components';
import Message from './Message';
import { AppContext } from '../Context/AppProvider';
import { addDocument } from '../firebase/services';
import { AuthContext } from '../Context/AuthProvider';
import useFirestore from '../../hooks/useFirestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function ChatWindow() {
   const {
      selectedRoom,
      selectedRoomPrivate,
      members,
      memberPrivate,
      setIsInviteMemberVisible,
      activeItem,
      setActiveItem,
   } = useContext(AppContext);
   const { uid, photoURL, displayName } = useContext(AuthContext);
   const [inputValue, setInputValue] = useState('');
   const [form] = Form.useForm();
   const messagesEndRef = useRef(null);
   const [selectedFiles, setSelectedFiles] = useState([]);
   const fileInputRef = useRef(null);
   let lastDate = '';

   const scrollToBottom = () => {
      setTimeout(() => {
         if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
         }
      }, 400);
   };

   const conditionMessage = useMemo(() => {
      if (selectedRoom.id) {
         return {
            fieldName: 'roomId',
            operator: '==',
            compareValue: selectedRoom.id,
         };
      }
      if (selectedRoomPrivate.id) {
         return {
            fieldName: 'roomId',
            operator: '==',
            compareValue: selectedRoomPrivate.id,
         };
      }
      return null;
   }, [selectedRoom.id, selectedRoomPrivate.id]);

   const messages = useFirestore('messages', conditionMessage);

   const handleInputChange = (e) => {
      setInputValue(e.target.value);
   };

   const handleOnSubmit = async () => {
      if (!inputValue.trim() && selectedFiles.length === 0) {
         return;
      }

      try {
         const currentTime = new Date();
         let fileURLs = [];
         if (selectedFiles.length > 0) {
            fileURLs = await uploadFiles(selectedFiles);
         }

         const messageData = {
            text: inputValue.trim(),
            uid,
            photoURL,
            roomId: selectedRoom.id || selectedRoomPrivate.id,
            displayName,
            fileURLs,
            createdAt: currentTime,
         };

         await addDocument(messageData, 'messages');

         const roomId = selectedRoom.id || selectedRoomPrivate.id;
         if (roomId.includes('_')) {
            await updateDoc(doc(db, 'privateChats', roomId), {
               latestMessageTime: currentTime,
            });
         } else {
            await updateDoc(doc(db, 'rooms', roomId), {
               latestMessageTime: currentTime,
            });
         }

         setSelectedFiles([]);
         setInputValue('');
         form.resetFields(['message']);

         if (fileInputRef.current) {
            fileInputRef.current.value = '';
         }
         scrollToBottom();
      } catch (error) {
         console.error('Error sending message:', error);
         message.error('Error sending message');
      }
   };

   function formatDate(seconds) {
      if (!seconds) return '';

      const date = new Date(seconds * 1000);
      return date.toISOString().split('T')[0];
   }

   const uploadFiles = async (files) => {
      const storage = getStorage();

      const uploadPromises = files.map(async (file) => {
         try {
            const fileType = file.type;
            const storageRef = ref(storage, `${fileType}s/${file.name}`);

            const snapshot = await uploadBytes(storageRef, file);

            const downloadURL = await getDownloadURL(snapshot.ref);
            return { downloadURL, fileType, fileName: file.name };
         } catch (error) {
            console.error(`Error uploading file ${file.name}: `, error);
            return null;
         }
      });

      try {
         const downloadURLs = await Promise.all(uploadPromises);
         return downloadURLs.filter((url) => url !== null);
      } catch (error) {
         console.error('Error uploading files: ', error);
         throw error;
      }
   };

   const handleUpload = () => {
      fileInputRef.current.click();
   };

   return (
      <WrapperStyled activeitem={activeItem ? 1 : 0}>
         {(selectedRoom.id || selectedRoomPrivate.id) && (
            <>
               <HeaderStyled>
                  <div
                     className='back-mobile'
                     onClick={() => setActiveItem(false)}
                  >
                     <ArrowLeftOutlined />
                  </div>
                  <div className='header__info'>
                     {selectedRoomPrivate.id && (
                        <div className='header__wrapper'>
                           <Avatar
                              src={memberPrivate[1]?.photoURL}
                              alt='error'
                              size={34}
                           />
                           <span className='header__title'>
                              {memberPrivate[1]?.displayName}
                           </span>
                        </div>
                     )}
                     {selectedRoom.id && (
                        <>
                           <p className='header__title'> {selectedRoom.name}</p>
                           <span className='header__description'>
                              {selectedRoom?.description}
                           </span>
                        </>
                     )}
                  </div>
                  {selectedRoom.id && (
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
                              <Tooltip
                                 title={member.displayName}
                                 key={member.uid}
                              >
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
                  )}
               </HeaderStyled>
               <ContentStyled>
                  <MessageListStyled>
                     {messages.map((message) => {
                        const messageDate = formatDate(
                           message?.createdAt?.seconds
                        );
                        const showDivider =
                           messageDate !== lastDate && lastDate !== '';

                        lastDate = messageDate;

                        return (
                           <React.Fragment key={message.id}>
                              {showDivider && (
                                 <DividerStyled key={`divider-${message.id}`}>
                                    {messageDate}
                                 </DividerStyled>
                              )}
                              <Message
                                 text={message.text}
                                 photoURL={message.photoURL}
                                 displayName={message.displayName}
                                 createAt={message.createdAt}
                                 author={message.uid === uid}
                                 id={message.id}
                                 fileURLs={message.fileURLs || []}
                              />
                           </React.Fragment>
                        );
                     })}
                     <div ref={messagesEndRef} />
                  </MessageListStyled>
                  <FormStyled form={form}>
                     <input
                        ref={fileInputRef}
                        type='file'
                        multiple
                        onChange={(e) =>
                           setSelectedFiles(Array.from(e.target.files))
                        }
                        style={{ display: 'none' }}
                     />
                     <SubFeature onClick={handleUpload}>
                        <PaperClipOutlined
                           style={{ fontSize: '20px', color: '#08c' }}
                        />
                     </SubFeature>

                     <Form.Item
                        name='message'
                        style={{ flex: 1, margin: '0 5px' }}
                     >
                        {selectedFiles.length > 0 && (
                           <Form.Item style={{ margin: '0 5px' }}>
                              <div>
                                 {selectedFiles.map((file, index) => (
                                    <div key={index}>{file.name}</div>
                                 ))}
                              </div>
                           </Form.Item>
                        )}
                        <InputStyled
                           placeholder='Enter something...'
                           autoComplete='off'
                           value={inputValue}
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
         )}
      </WrapperStyled>
   );
}

const WrapperStyled = styled.div`
   margin: 20px 10px 20px 10px;
   border-radius: 12px;
   box-shadow: rgba(52, 72, 84, 0.05) 0px 0px 8px 0px;
   background-color: #fff;
   height: calc(100vh - 40px);
   flex: 2;

   @media (max-width: 425px) {
      display: ${({ activeitem }) => (activeitem ? 'block' : 'none')};
   }
`;

const HeaderStyled = styled.div`
   display: flex;
   justify-content: space-between;
   height: 58px;
   padding: 0 16px;
   align-items: center;

   .back-mobile {
      display: none;
   }

   .header {
      &__info {
         display: flex;
         flex-direction: column;
         justify-content: center;
         font-size: 16px;
      }

      &__wrapper {
         display: flex;
         align-items: center;
      }

      &__title {
         margin: 0;
         font-weight: 600;
         margin-inline: 5px;
      }

      &__description {
         font-size: 12px;
         margin-inline: 5px;
      }
   }

   @media (max-width: 425px) {
      .back-mobile {
         display: block;
      }
   }
`;

const ButtonGroupStyled = styled.div`
   display: flex;
   align-items: center;
`;

const ContentStyled = styled.div`
   height: calc(96vh - 75px);
   display: flex;
   flex-direction: column;
   margin: 5px 5px 5px 10px;
   justify-content: flex-end;
`;

const FormStyled = styled(Form)`
   display: flex;
   align-items: flex-end;
   width: 100%;
   padding: 10px 15px;
`;

const InputStyled = styled(Input)`
   flex: 1;
   margin-right: 8px;
   border-radius: 20px;
   height: 36px;
   background-color: #f0f0f0;
`;

const MessageListStyled = styled.div`
   overflow-y: auto;
`;

const WrapperButtonInvite = styled.div`
   margin: 0 4px;
`;

const DividerStyled = styled.div`
   margin: 20px 0;
   text-align: center;
   color: #999;
   font-size: 14px;
   position: relative;

   &::before,
   &::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 45%;
      height: 1px;
      background-color: #ccc;
   }

   &::before {
      left: 0;
   }

   &::after {
      right: 0;
   }
`;

const SubFeature = styled.div`
   margin: 5px;
   padding: 5px;
   display: inline-flex;
   align-items: center;
   justify-content: center;
   cursor: pointer;

   &:hover {
      background-color: #f0f0f0;
      border-radius: 50%;
   }
`;
