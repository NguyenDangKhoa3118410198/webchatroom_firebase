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
      await addDoc(collection(db, collectionName), {
         ...data,
         createdAt: serverTimestamp(),
      });
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

export const generateKeywords = (displayName) => {
   const name = displayName.split(' ').filter((word) => word);

   const length = name.length;
   let flagArray = [];
   let result = [];
   let stringArray = [];

   for (let i = 0; i < length; i++) {
      flagArray[i] = false;
   }

   const createKeywords = (name) => {
      const arrName = [];
      let curName = '';
      name.split('').forEach((letter) => {
         curName += letter;
         arrName.push(curName);
      });
      return arrName;
   };

   function findPermutation(k) {
      for (let i = 0; i < length; i++) {
         if (!flagArray[i]) {
            flagArray[i] = true;
            result[k] = name[i];

            if (k === length - 1) {
               stringArray.push(result.join(' '));
            }

            findPermutation(k + 1);
            flagArray[i] = false;
         }
      }
   }

   findPermutation(0);

   const keywords = stringArray.reduce((acc, cur) => {
      const words = createKeywords(cur);
      return [...acc, ...words];
   }, []);

   return keywords;
};
