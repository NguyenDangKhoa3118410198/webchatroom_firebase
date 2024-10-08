import {
   CloseCircleOutlined,
   DeleteOutlined,
   DownOutlined,
   SendOutlined,
   UploadOutlined,
} from '@ant-design/icons';
import { Button, Form, Input, message, Upload } from 'antd';
import React, {
   useContext,
   useState,
   useMemo,
   useRef,
   useEffect,
   useCallback,
} from 'react';
import styled from 'styled-components';
import { AppContext } from '../Context/AppProvider';
import { addDocument } from '../firebase/services';
import { AuthContext } from '../Context/AuthProvider';
import useFirestore from '../../hooks/useFirestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import {
   collection,
   doc,
   getDocs,
   query,
   updateDoc,
   where,
   writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { ReactComponent as WaittingChat } from '../../imgs/waitting-chat.svg';
import { HeaderChatWindow } from './HeaderChatWindow';
import { DetailRoom } from './DetailRoom';
import { FeaturesInput } from './FeaturesInput';
import { MessagesList } from './MessagesList';

export default function ChatWindow() {
   const {
      selectedRoom,
      selectedRoomPrivate,
      members,
      memberPrivate,
      setIsInviteMemberVisible,
      activeItem,
      setActiveItem,
      selectedRoomId,
   } = useContext(AppContext);
   const { uid, photoURL, displayName } = useContext(AuthContext);
   const [inputValue, setInputValue] = useState('');
   const [openEmoji, setOpenEmoji] = useState(false);
   const [form] = Form.useForm();
   const [selectedFiles, setSelectedFiles] = useState([]);
   const messagesEndRef = useRef(null);
   const fileInputRef = useRef(null);
   const pickerRef = useRef(null);
   const iconEmoji = useRef(null);
   const [showScrollToBottom, setShowScrollToBottom] = useState(false);
   const chatContainerRef = useRef(null);
   const [showDetail, setShowDetail] = useState(false);
   const [audioBlob, setAudioBlob] = useState('');
   const [recording, setRecording] = useState(false);
   const [audioURL, setAudioURL] = useState('');
   const [nofityNewMess, setNotifyNewMess] = useState(false);
   const otherMember = selectedRoomId.includes('_')
      ? memberPrivate.filter((o) => o.uid !== uid)
      : members.filter((o) => o.uid !== uid);

   useEffect(() => {
      const preloadEmojiPicker = () => {
         import('emoji-picker-react');
      };
      preloadEmojiPicker();
   }, []);

   const conditionMessage = useMemo(() => {
      if (selectedRoomId) {
         return {
            fieldName: 'roomId',
            operator: '==',
            compareValue: selectedRoomId,
         };
      }
      return null;
   }, [selectedRoomId]);

   const messages = useFirestore('messages', conditionMessage);

   useEffect(() => {
      const handleScroll = () => {
         const container = chatContainerRef.current;

         if (container) {
            const isScrollPresent =
               container.scrollHeight > container.clientHeight;

            const scrollFromBottom =
               container.scrollHeight -
               container.scrollTop -
               container.clientHeight;

            if (isScrollPresent) {
               if (scrollFromBottom > 150) {
                  setShowScrollToBottom(true);
               } else {
                  setShowScrollToBottom(false);
               }
            } else {
               setShowScrollToBottom(false);
            }
         }
      };

      const container = chatContainerRef.current;
      if (container) {
         container.addEventListener('scroll', handleScroll);
      }
      setAudioBlob('');
      setRecording(false);
      setSelectedFiles([]);

      return () => {
         if (container) {
            container.removeEventListener('scroll', handleScroll);
         }
      };
   }, [selectedRoom.id, selectedRoomPrivate.id]);

   const scrollToEnd = (timeout = 0) => {
      setTimeout(() => {
         if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView();
         }
      }, timeout);
   };

   const updateSeenMessages = useCallback(
      async (timeout = 0) => {
         if (selectedRoomId) {
            const q = query(
               collection(db, 'messages'),
               where('roomId', '==', selectedRoomId)
            );

            const querySnapshot = await getDocs(q);
            const batch = writeBatch(db);
            let hasUpdates = false;

            querySnapshot.forEach((doc) => {
               const seen = doc.data().seen;
               const messageRef = doc.ref;

               if (seen && seen[`${uid}`] === false) {
                  batch.update(messageRef, {
                     [`seen.${uid}`]: true,
                  });
                  hasUpdates = true;
               }
            });

            if (hasUpdates) {
               await batch.commit();
            }
         }
         scrollToEnd(timeout);
         setNotifyNewMess(false);
      },
      [selectedRoomId, uid]
   );

   useEffect(() => {
      updateSeenMessages();
   }, [selectedRoomId, updateSeenMessages]);

   useEffect(() => {
      scrollToEnd(400);
   }, [selectedRoomId, selectedRoom.id, selectedRoomPrivate.id]);

   useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
      };
   }, []);

   const handleInputChange = (e) => {
      setInputValue(e.target.value);
      setOpenEmoji(false);
   };

   const getInitialSeenStatus = (members) => {
      const seenStatus = {};
      members.forEach((member) => {
         if (uid === member.uid) {
            seenStatus[member.uid] = true;
         } else {
            seenStatus[member.uid] = false;
         }
      });
      return seenStatus;
   };

   const uploadAudioToFirebase = async (audioBlob) => {
      const storage = getStorage();
      const fileType = audioBlob.type;
      const fileName = `audio-${Date.now()}.wav`;
      const storageRef = ref(storage, `audios/${fileName}`);

      try {
         const snapshot = await uploadBytes(storageRef, audioBlob);

         const downloadURL = await getDownloadURL(snapshot.ref);

         return { downloadURL, fileType, fileName };
      } catch (error) {
         console.error('Error uploading audio:', error);
         throw error;
      }
   };

   const handleOnSubmit = async () => {
      if (
         (!inputValue || !inputValue.trim()) &&
         selectedFiles.length === 0 &&
         !audioBlob
      ) {
         return;
      }

      try {
         const currentTime = new Date();
         const roomId = selectedRoom.id || selectedRoomPrivate.id;
         const seenRoom = selectedRoom.id ? members : memberPrivate;

         if (inputValue.trim()) {
            const messageData = {
               text: inputValue.trim(),
               uid,
               photoURL,
               roomId,
               displayName,
               createdAt: currentTime,
               seen: getInitialSeenStatus(seenRoom),
            };

            await addDocument(messageData, 'messages');

            if (roomId.includes('_')) {
               await updateDoc(doc(db, 'privateChats', roomId), {
                  latestMessageTime: currentTime,
               });
            } else {
               await updateDoc(doc(db, 'rooms', roomId), {
                  latestMessageTime: currentTime,
               });
            }

            setInputValue('');
            form.resetFields(['message']);
         }

         if (selectedFiles.length > 0) {
            const fileURLs = await uploadFiles(selectedFiles);

            for (const fileData of fileURLs) {
               const messageData = {
                  text: '',
                  uid,
                  photoURL,
                  roomId,
                  displayName,
                  fileURLs: [fileData],
                  createdAt: currentTime,
                  seen: getInitialSeenStatus(seenRoom),
               };

               await addDocument(messageData, 'messages');
            }

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
            if (fileInputRef.current) {
               fileInputRef.current.value = '';
            }
         }

         if (audioBlob) {
            const audioFileURL = await uploadAudioToFirebase(audioBlob);
            const messageData = {
               text: '',
               uid,
               photoURL,
               roomId,
               displayName,
               fileURLs: [audioFileURL],
               createdAt: currentTime,
               seen: getInitialSeenStatus(seenRoom),
            };

            await addDocument(messageData, 'messages');

            if (roomId.includes('_')) {
               await updateDoc(doc(db, 'privateChats', roomId), {
                  latestMessageTime: currentTime,
               });
            } else {
               await updateDoc(doc(db, 'rooms', roomId), {
                  latestMessageTime: currentTime,
               });
            }

            setAudioBlob('');
         }

         updateSeenMessages(selectedFiles.length > 0 || audioBlob ? 600 : 0);
      } catch (error) {
         console.error('Error sending message:', error);
         message.error('Error sending message');
      }
   };

   const uploadFiles = async (files) => {
      const storage = getStorage();

      const fileUploadPromises = files.map(async (file) => {
         try {
            const fileType = file.type;
            const isTextFile = fileType.startsWith('text/');
            const metadata = {
               contentType: isTextFile ? 'application/octet-stream' : fileType,
            };

            const storageRef = ref(storage, `${fileType}s/${file.name}`);

            const snapshot = await uploadBytes(storageRef, file, metadata);

            const downloadURL = await getDownloadURL(snapshot.ref);

            return { downloadURL, fileType, fileName: file.name };
         } catch (error) {
            console.error(`Error uploading file ${file.name}: `, error);
            return null;
         }
      });

      const results = await Promise.allSettled(fileUploadPromises);

      const fileUploadResults = results
         .filter(
            (result) => result.status === 'fulfilled' && result.value !== null
         )
         .map((result) => result.value);

      return fileUploadResults;
   };

   const handleUpload = () => {
      fileInputRef.current.click();
   };

   const handleEmojiSelect = useCallback((emoji) => {
      setInputValue((prev) => prev + emoji?.emoji);
   }, []);

   const handleClickOutside = (event) => {
      if (
         pickerRef.current &&
         !pickerRef.current.contains(event.target) &&
         !iconEmoji.current.contains(event.target)
      ) {
         setOpenEmoji(false);
      }
   };

   const handleEmojiOpen = () => {
      setOpenEmoji((prevValue) => !prevValue);
   };

   const handleRemove = (file) => {
      setSelectedFiles((prevFiles) =>
         prevFiles.filter((item) => item.name !== file.name)
      );
   };

   const handleDraggerChange = (info) => {
      const newFiles = info.fileList
         .map((fileWrapper) => fileWrapper.originFileObj)
         .filter((file) => !!file);

      setSelectedFiles((prevFiles) => {
         const nonDuplicateFiles = newFiles.filter(
            (newFile) =>
               !prevFiles.some((prevFile) => prevFile.name === newFile.name)
         );

         return [...prevFiles, ...nonDuplicateFiles];
      });
   };

   const handleFileChange = (e) => {
      const newFiles = Array.from(e.target.files);

      const updatedFiles = [...selectedFiles];

      newFiles.forEach((newFile) => {
         const isDuplicate = updatedFiles.some(
            (file) =>
               file.name === newFile.name &&
               file.lastModified === newFile.lastModified
         );
         if (!isDuplicate) {
            updatedFiles.push(newFile);
         }
      });

      setSelectedFiles(updatedFiles);
   };

   return (
      <>
         <WrapperStyled
            $activeitem={activeItem ? 1 : 0}
            $showdetail={showDetail ? 1 : 0}
         >
            {selectedRoom.id || selectedRoomPrivate.id ? (
               <>
                  <HeaderChatWindow
                     otherMember={otherMember}
                     selectedRoomPrivate={selectedRoomPrivate}
                     selectedRoom={selectedRoom}
                     members={members}
                     setIsInviteMemberVisible={setIsInviteMemberVisible}
                     setActiveItem={setActiveItem}
                     showDetail={showDetail}
                     setShowDetail={setShowDetail}
                  />
                  <ContentStyled style={{ position: 'relative' }}>
                     {nofityNewMess && (
                        <ButtonNotifyNewMess
                           shape='round'
                           onClick={updateSeenMessages}
                        >
                           You have a new message <DownOutlined />
                        </ButtonNotifyNewMess>
                     )}
                     {showScrollToBottom && (
                        <ButtonScroll
                           onClick={updateSeenMessages}
                           shape='circle'
                        >
                           <DownOutlined />
                        </ButtonScroll>
                     )}
                     <MessageListStyled ref={chatContainerRef}>
                        <MessagesList
                           messages={messages}
                           uid={uid}
                           nofityNewMess={nofityNewMess}
                           setNotifyNewMess={setNotifyNewMess}
                        />

                        <div ref={messagesEndRef} />
                     </MessageListStyled>

                     <FormStyled form={form}>
                        <WrapperForm>
                           {selectedFiles.length > 0 && (
                              <WrapperTopInput>
                                 <Upload.Dragger
                                    onChange={handleDraggerChange}
                                    fileList={selectedFiles}
                                    multiple
                                    autoUpload={false}
                                    beforeUpload={() => false}
                                    showUploadList={false}
                                    className='space-dragger-upload'
                                 >
                                    <p className='ant-upload-drag-icon'>
                                       <UploadOutlined />
                                    </p>
                                 </Upload.Dragger>
                                 <WrapperRightDragger>
                                    <Form.Item
                                       style={{
                                          margin: '0 5px',
                                          width: '100%',
                                       }}
                                    >
                                       <WrapperTotalSelected>
                                          <span>{`Selected files: ${selectedFiles.length}`}</span>
                                          <span
                                             className='delete-all'
                                             onClick={() =>
                                                setSelectedFiles([])
                                             }
                                          >
                                             Delete All
                                          </span>
                                       </WrapperTotalSelected>
                                       <WrapperListSelectedFiles>
                                          {selectedFiles.map((file) => {
                                             return (
                                                <ItemSelectedFile
                                                   key={file.uid}
                                                >
                                                   <span className='item-name'>
                                                      {file.name}
                                                   </span>
                                                   <DeleteOutlined
                                                      className='item-delete'
                                                      onClick={() =>
                                                         handleRemove(file)
                                                      }
                                                   />
                                                </ItemSelectedFile>
                                             );
                                          })}
                                       </WrapperListSelectedFiles>
                                    </Form.Item>
                                 </WrapperRightDragger>
                              </WrapperTopInput>
                           )}
                           <WrapperBottomInput>
                              <input
                                 ref={fileInputRef}
                                 type='file'
                                 multiple
                                 onChange={(e) => handleFileChange(e)}
                                 style={{ display: 'none' }}
                              />

                              <FeaturesInput
                                 handleUpload={handleUpload}
                                 setAudioBlob={setAudioBlob}
                                 setRecording={setRecording}
                                 setAudioURL={setAudioURL}
                                 recording={recording}
                                 handleEmojiOpen={handleEmojiOpen}
                                 openEmoji={openEmoji}
                                 handleEmojiSelect={handleEmojiSelect}
                                 pickerRef={pickerRef}
                                 ref={iconEmoji}
                              />

                              <Form.Item
                                 name='message'
                                 style={{ flex: 1, margin: '0 5px' }}
                              >
                                 <div>
                                    <WrapperInput>
                                       {audioBlob ? (
                                          <>
                                             <StopRecording
                                                onClick={() => setAudioBlob('')}
                                             >
                                                <CloseCircleOutlined
                                                   style={{ color: 'red' }}
                                                />
                                             </StopRecording>
                                             <AudioStyled
                                                controls
                                                src={audioURL}
                                             />
                                          </>
                                       ) : (
                                          <InputStyled
                                             placeholder={
                                                recording
                                                   ? 'Recording'
                                                   : 'Enter something...'
                                             }
                                             autoComplete='off'
                                             value={inputValue}
                                             onChange={handleInputChange}
                                             onPressEnter={handleOnSubmit}
                                             disabled={recording}
                                          />
                                       )}
                                       <Input
                                          value={inputValue}
                                          disabled
                                          readOnly
                                          style={{ display: 'none' }}
                                       />
                                    </WrapperInput>
                                 </div>
                              </Form.Item>

                              <Button
                                 type='primary'
                                 onClick={handleOnSubmit}
                                 style={{ marginBottom: '4px' }}
                              >
                                 <SendOutlined />
                              </Button>
                           </WrapperBottomInput>
                        </WrapperForm>
                     </FormStyled>
                  </ContentStyled>
               </>
            ) : (
               <WaittingChatWrapper>
                  <LabelWaittingChat>
                     Choose a room to start chatting
                  </LabelWaittingChat>
                  <WaittingChat />
               </WaittingChatWrapper>
            )}
         </WrapperStyled>
         {showDetail && activeItem && (
            <DetailRoom
               setShowDetail={setShowDetail}
               otherMember={otherMember}
               messages={messages}
            />
         )}
      </>
   );
}

const WrapperStyled = styled.div`
   margin: 20px 10px;
   border-radius: 12px;
   box-shadow: rgba(52, 72, 84, 0.05) 0px 0px 8px 0px;
   background-color: #fff;
   height: calc(100vh - 40px);
   flex: 2;
   overflow: hidden;

   @media (max-width: 425px) {
      display: ${(props) =>
         props.$activeitem && !props.$showdetail ? 'block' : 'none'};
      flex: 1;
   }
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
   background-color: #f3f3f5;
   font-size: 16px;
`;

const StopRecording = styled.div`
   margin-inline: 8px;
   cursor: pointer;
`;

const AudioStyled = styled.audio`
   flex: 1;
   height: 36px;
`;

const WrapperInput = styled.div`
   display: flex;
   justify-content: flex-start;
   align-items: center;
`;

const MessageListStyled = styled.div`
   overflow-y: auto;
`;

const WaittingChatWrapper = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   height: 100%;
`;

const LabelWaittingChat = styled.h3`
   margin: 5px;
   font-weight: 700;
`;

const ButtonScroll = styled(Button)`
   position: absolute;
   bottom: 10%;
   left: 50%;
   transform: translateX(-50%);
   z-index: 100;
`;

const ButtonNotifyNewMess = styled(Button)`
   position: absolute;
   top: 0;
   left: 50%;
   transform: translateX(-50%);
   z-index: 100;
`;

const WrapperListSelectedFiles = styled.div`
   max-height: 100px;
   overflow: auto;
`;

const ItemSelectedFile = styled.div`
   display: flex;
   align-items: center;
   margin-bottom: 8px;

   .item-name {
      flex: 1;
      display: inline-block;
      max-width: calc(100% - 25px);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
   }

   .item-delete {
      margin-left: 5px;
      width: 20px;
      cursor: pointer;
      color: red;
   }

   &:hover {
      background-color: #e0e0e0;
   }
`;

const WrapperTotalSelected = styled.div`
   display: flex;

   .delete-all {
      margin-left: auto;
      color: red;
      cursor: pointer;
   }
`;

const WrapperForm = styled.div`
   display: flex;
   flex-direction: column;
   width: 100%;
`;

const WrapperBottomInput = styled.div`
   display: flex;
`;

const WrapperTopInput = styled.div`
   display: flex;
   width: 100%;
   margin-bottom: 10px;

   .space-dragger-upload {
      padding: 10;
      flex: 1;
      min-width: 100px;
   }

   @media (max-width: 425px) {
      .space-dragger-upload {
         display: none;
      }
   }
`;

const WrapperRightDragger = styled.div`
   padding: 5px 10px;
   flex: 1;
`;
