import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TextInput, Button, Modal, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { collection, addDoc, getFirestore, query, where, getDocs, QueryDocumentSnapshot } from "firebase/firestore"; 
import { db } from './config';
import * as MediaLibrary from 'expo-media-library';
import QRCode from 'react-native-qrcode-svg';
import * as MailComposer from 'expo-mail-composer';
import { captureRef } from 'react-native-view-shot';
import ViewShot from 'react-native-view-shot';

// Interface for Firestore document
interface Student {
  id: string;
  name: string;
  mail: string;
}

export default function TabTwoScreen() {
  const [username, setUsername] = useState('');
  const [id, setId] = useState('');
  const [mail, setMail] = useState('');
  const [qrCodeValue, setQrcode] = useState('default');
  const [isModalVisible, setModalVisible] = useState(false);
  const qrCodeRef = useRef(null);
  const imageRef = useRef(null);
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const [searchResults, setSearchResults] = useState<Student[]>([]); // Array of Student interface

  // Function to add data to Firestore
  const create = () => {
    addDoc(collection(db, "student"), {
      id: id,
      name: username,
      mail: mail,
    }).then(() => {
      console.log('Data submitted successfully');
    }).catch((error) => {
      console.log(error);
    });
  };

  // Function to search Firestore documents
  const searchKeyword = async (keyword: string) => {
    try {
      const q = query(collection(db, "student"), where("name", "==", keyword)); // Replace with your field and keyword
      const querySnapshot = await getDocs(q);

      // Map query snapshot to Student interface
      const results: Student[] = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        name: doc.data().name,
        mail: doc.data().mail,
      }));

      setSearchResults(results);
      console.log("Search Results:", results);
    } catch (error) {
      console.error("Error searching documents: ", error);
    }
  };

  // Function to combine data and generate QR code value
  const handleGenerateQRCode = () => {
    const combinedData = `${username}-${id}-${mail}`;
    setQrcode(combinedData);
  };

  // Function to handle sending email with QR code image
  const handleSendEmail = async () => {
    const subject = 'QR Code Image';
    const body = 'Please find the QR code image attached.';

    try {
      if (imageRef.current) {
        const localUri = await captureRef(imageRef.current, {
          height: 440,
          quality: 1,
        });
        const { status } = await MailComposer.composeAsync({
          recipients: [`${mail}`],
          subject: subject,
          body: body,
          attachments: [localUri],
        });
        if (status === 'sent') {
          alert('Email sent successfully!');
        }
      } else {
        console.error('imageRef.current is null or undefined');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  // Function to save QR code image to device storage
  const onSaveImageAsync = async () => {
    try {
      if (imageRef.current) {
        const localUri = await captureRef(imageRef.current, {
          height: 440,
          quality: 1,
        });
        // await MediaLibrary.saveToLibraryAsync(localUri);
      } else {
        console.error('imageRef.current is null or undefined');
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Function to display QR code modal and initiate actions
  const showQRCodeAlert = () => {
    setModalVisible(true);
  };

  // Function to close modal, save image, create data, generate QR code, and send email
  const closeAndSaveImage = async () => {
    try {
      await onSaveImageAsync();
      await create();
      handleGenerateQRCode();
      searchKeyword(username);
      await handleSendEmail();
      setModalVisible(false);
    } catch (error) {
      console.error('Error closing and saving image:', error);
    }
  };

  // Request permissions if status is null
  if (status === null) {
    requestPermission();
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={<Ionicons size={310} name="code-slash" style={styles.headerImage} />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Ajout</ThemedText>
      </ThemedView>
      <TextInput value={username} onChangeText={(username) => { setUsername(username) }} placeholder='Matricule' style={styles.textBoxes} />
      <TextInput value={id} onChangeText={(id) => { setId(id) }} placeholder='Nom et Prenom' style={styles.textBoxes} />
      <TextInput value={mail} onChangeText={(mail) => { setMail(mail) }} placeholder='Mail' style={styles.textBoxes} />
      <Button title="Ajouter etudiant" onPress={showQRCodeAlert} />

      {/* Modal for QR code display and email sending */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ViewShot ref={imageRef} options={{ format: 'png', quality: 1.0 }}>
            <View style={styles.modalContent}>
              <QRCode ref={qrCodeRef} value={qrCodeValue} size={200} />
            </View>
          </ViewShot>
          <Button title="Envoyer par mail" onPress={closeAndSaveImage} />
        </View>
      </Modal>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  textBoxes: {
    width: '90%',
    backgroundColor: 'gray',
    fontSize: 18,
    padding: 12,
    borderColor: 'Gray',
    borderWidth: 0.1,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 0,
    alignItems: 'center',
  },
});
