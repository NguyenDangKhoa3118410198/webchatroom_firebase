import {
   CloseCircleOutlined,
   DownOutlined,
   PaperClipOutlined,
   SendOutlined,
   SmileOutlined,
} from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import React, {
   useContext,
   useState,
   useMemo,
   useRef,
   useEffect,
   useCallback,
} from 'react';
import styled from 'styled-components';
import Message from './Message';
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
import { VoiceRecoder } from './VoiceRecoder';
const EmojiPicker = React.lazy(() => import('emoji-picker-react'));

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
   let lastDate = '';

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

   function formatDate(seconds) {
      if (!seconds) return '';

      const date = new Date(seconds * 1000);
      return date.toISOString().split('T')[0];
   }

   const uploadFiles = async (files) => {
      const storage = getStorage();

      const fileUploadPromises = files.map(async (file) => {
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
                        {messages.map((message) => {
                           const messageDate = formatDate(
                              message?.createdAt?.seconds
                           );
                           const showDivider =
                              messageDate !== lastDate && lastDate !== '';

                           lastDate = messageDate;
                           if (
                              message.seen &&
                              message.seen[uid] === false &&
                              !nofityNewMess
                           ) {
                              setNotifyNewMess(true);
                           }
                           return (
                              <React.Fragment key={message.id}>
                                 {showDivider && (
                                    <DividerStyled
                                       key={`divider-${message.id}`}
                                       visible={showDivider}
                                    >
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
                           <PaperClipOutlined />
                        </SubFeature>

                        <SubFeature>
                           <VoiceRecoder
                              setAudioBlob={setAudioBlob}
                              setRecording={setRecording}
                              setAudioURL={setAudioURL}
                              recording={recording}
                           />
                        </SubFeature>

                        <Form.Item
                           name='message'
                           style={{ flex: 1, margin: '0 5px' }}
                        >
                           <div>
                              {selectedFiles.length > 0 && (
                                 <div>
                                    <Form.Item style={{ margin: '0 5px' }}>
                                       <div>
                                          {selectedFiles.map((file, index) => (
                                             <div key={index + file.name}>
                                                {file.name}
                                             </div>
                                          ))}
                                       </div>
                                    </Form.Item>
                                 </div>
                              )}
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
                                       <AudioStyled controls src={audioURL} />
                                    </>
                                 ) : (
                                    <InputStyled
                                       placeholder='Enter something...'
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

                        <div style={{ position: 'relative' }}>
                           <SubFeature
                              onClick={handleEmojiOpen}
                              ref={iconEmoji}
                           >
                              <SmileOutlined />
                           </SubFeature>
                           <PopupEmoji>
                              <div
                                 style={{
                                    position: 'absolute',
                                    bottom: '50px',
                                    right: 0,
                                 }}
                                 ref={pickerRef}
                              >
                                 <EmojiPicker
                                    open={openEmoji}
                                    onEmojiClick={handleEmojiSelect}
                                 />
                              </div>
                           </PopupEmoji>
                        </div>

                        <Button
                           type='primary'
                           onClick={handleOnSubmit}
                           style={{ marginBottom: '4px' }}
                        >
                           <SendOutlined />
                        </Button>
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

const SubFeature = styled.div`
   margin: 5px;
   padding: 5px;
   display: inline-flex;
   align-items: center;
   justify-content: center;
   cursor: pointer;
   font-size: 20px;
   color: #08c;

   &:hover {
      background-color: #f0f0f0;
      border-radius: 50%;
   }
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

const PopupEmoji = styled.div`
   position: relative;
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
