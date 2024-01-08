import {
   addDoc,
   collection,
   getDocs,
   query,
   where,
   serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const addDocument = async (data, collectionName) => {
   try {
      const docRef = await addDoc(collection(db, collectionName), {
         ...data,
         createdAt: serverTimestamp(),
      });
      console.log({ docRef });
   } catch (error) {
      console.error('Error adding document to Firestore:', error);
   }
};

export const checkExistsEmmailAndAddDocument = async (data, collectionName) => {
   try {
      const emailQuery = query(
         collection(db, collectionName),
         where('email', '==', data.email)
      );
      const emailSnapshot = await getDocs(emailQuery);

      if (emailSnapshot.docs.length > 0) {
         console.log('Email already exists in Firestore');
         return;
      }

      const docRef = await addDoc(collection(db, collectionName), {
         ...data,
         createdAt: serverTimestamp(),
      });
      console.log('Document added to Firestore:', docRef);
   } catch (error) {
      console.error('Error adding document to Firestore:', error);
   }
};
