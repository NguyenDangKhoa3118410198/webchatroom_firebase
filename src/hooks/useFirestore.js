import React, { useState } from 'react';
import {
   collection,
   onSnapshot,
   where,
   query,
   orderBy,
   limit as firestoreLimit,
} from 'firebase/firestore';
import { db } from '../components/firebase/config';

const useFirestore = (
   collectionName,
   condition,
   orderDirection = 'asc',
   limit = null
) => {
   const [documents, setDocuments] = useState([]);

   React.useEffect(() => {
      let collectionRef = collection(db, collectionName);
      const orderByFields = {
         messages: 'createdAt',
         rooms: 'latestMessageTime',
         privateChats: 'latestMessageTime',
      };

      if (!condition) return;

      if (condition) {
         if (!condition.compareValue || !condition.compareValue.length) {
            return;
         }

         let queryRef = query(
            collectionRef,
            where(
               condition.fieldName,
               condition.operator,
               condition.compareValue
            )
         );

         if (orderByFields[collectionName]) {
            queryRef = query(
               queryRef,
               orderBy(orderByFields[collectionName], orderDirection)
            );

            if (Number.isInteger(limit) && limit > 0) {
               queryRef = query(queryRef, firestoreLimit(limit));
            }
         }

         collectionRef = queryRef;
      }

      const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
         const documents = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
         }));
         setDocuments(documents);
      });

      return () => unsubscribe();
   }, [collectionName, condition, orderDirection, limit]);

   return documents;
};

export default useFirestore;
