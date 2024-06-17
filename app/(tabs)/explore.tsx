import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, TextInput, Button, Modal, View } from 'react-native';
import React, { useRef, useState } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { collection, doc, setDoc, addDoc } from "firebase/firestore"; 
import { db } from './config';
import { Linking } from 'react-native';


import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';
import QRCode from 'react-native-qrcode-svg';

export default function TabTwoScreen() {
  const [username, setName] = useState('');
  const [id, setId] = useState('');
  const [mail, setMail] = useState('');
  const [qrCodeValue, setQrcode] = useState('default');
  const [isModalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const qrCodeRef = useRef(null);

  function create() {
    // submit data 
    addDoc(collection(db, "student" ), {
      id: id,
      name: username,
      mail: mail,
    }).then(() =>{
      //Data saved successfully
      console.log('data submited');
    }).catch((error) =>{
      //failed
      console.log(error);
    });
  }
  //combine data
  const handleGenerateQRCode = () => {
    const combinedData = `${username}-${id}-${mail}`; // Example: username-id
    setQrcode(combinedData);
    console.log("ao")
  };

  if (status === null) {
    requestPermission();
  }
  // mail 
  const onSaveImageAsync = async () => {
    try {
        alert("Saved!");
    } catch (e) {
      console.log(e);
    }
  };

  const handleSendEmail = async () => {
    const subject = 'Your Email Subject';
    const body = qrCodeValue;

    const mailtoUrl = `mailto:${mail}@example.com?subject=${subject}&body=${body}`;
  
    try {
      // Open the user's default email app with pre-filled content
      const supported = await Linking.canOpenURL(mailtoUrl);
  
      if (supported) {
        await Linking.openURL(mailtoUrl);
      } else {
        alert('No email app found.');
      }
    } catch (error) {
      console.error('Error opening email app:', error);
    }
  };
  
  // show modal
  const showQRCodeAlert = () => {
    setModalVisible(true);
  };

  
  const closeAndSaveImage = async () => {
    create();
    handleSendEmail();
    handleGenerateQRCode();
    onSaveImageAsync();
    setModalVisible(false);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={<Ionicons size={310} name="code-slash" style={styles.headerImage} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Ajout</ThemedText>
      </ThemedView>
      <TextInput value={username} onChangeText={(username) => {setName(username)}} placeholder='id' style={styles.textBoxes} />
      <TextInput value={id} onChangeText={(id) => {setId(id)}} placeholder='Username' style={styles.textBoxes} />
      <TextInput value={mail} onChangeText={(mail) => {setMail(mail)}} placeholder='Mail' style={styles.textBoxes} />

      <Button title="Show QR Code" onPress={showQRCodeAlert} />

      {/* Modal to display the QR code */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <QRCode ref={qrCodeRef} value={qrCodeValue} size={200} />
            <Button title="Close" onPress={closeAndSaveImage} />
          </View>
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
    marginBottom: 10, // Add margin between text inputs
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
    borderRadius: 10,
    alignItems: 'center',
  }
});
