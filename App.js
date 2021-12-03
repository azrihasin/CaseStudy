import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Pressable,
  Alert,
  Modal,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function App() {
  const [text, setText] = useState(null)
  const [number, setNumber] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [displayParcel, setDisplayParcel] = useState(null)

  //INITIALIZE PARCEL STORAGE

  let parcel = []

  for (let i = 0; i < 30; i++) {
    parcel.push({
      id: i,
      parcelStored: 0,
      subStorage: [],
    })
  }

  const [data, setData] = useState(parcel)

  //FOR LOCAL STORAGE
  // USE THIS FUNCTION TO SAVE DATA INTO LOCAL STORAGE

  const storeData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem('storage', jsonValue)
    } catch (e) {
      // saving error
    }
  }

  // USE THIS FUNCTION TO GET DATA FROM LOCAL STORAGE

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('storage')
      if (jsonValue != null) {
        const converted = JSON.parse(jsonValue);
        for (let i = 0; i < converted .length; i++) {
          for (let j = 0; j < converted [i].subStorage.length; j++) {
            const parcelCreatedAt = new Date(converted[i].subStorage[j].date);
            if ((Date.now() - parcelCreatedAt.getTime()) > 1000 * 60 * 60 * 24 * 2) {
              converted[i].subStorage.splice(j, 1);
              converted[i].parcelStored -= 1;
            }
          }
        }
        storeData(converted);
        setData(converted);
      }
    } catch (e) {
      // error reading value
    }
  }

  //ADD PARCEL TO STATE AND LOCAL STORAGE

  const addParcel = () => {
    let updatedData = data.map((item) => {
      if (item.id == number - 1) {
        if (item.parcelStored < 5) {
          const newParcel = { name: text, houseNumber: number, date: new Date().toString() }
          item.subStorage.push(newParcel)

          var count = item.parcelStored
          return { ...item, parcelStored: count + 1 }
        }

        else {
          Alert.alert('The storage slot is full. Parcel cannot be added.')
        }
      }

      return item // else return unmodified item
    })

    setData(updatedData)
    storeData(updatedData)
  }

  //WHEN FLAT LIST CLICKED OPEN ALERT MENU

  const openStorage = (id) => {
    setDisplayParcel(data[parseInt(id)])
    setModalVisible(true)
  }

  //RESET ALL STORAGE

  const resetStorage = () => {
    setData(parcel)
    storeData(parcel)
  }

  //USE EFFECT USED TO INITIALIZE THE APP STATE

  useEffect(() => {
    getData()
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Enter parcel details here:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(val) => setText(val)}
        value={text}
        placeholder="Product Name"
      />
      <TextInput
        style={styles.input}
        onChangeText={(val) => setNumber(val)}
        value={number}
        placeholder="House Number"
        keyboardType="numeric"
      />
      <Pressable style={styles.button} onPress={addParcel}>
        <Text style={styles.text}>Add Parcel</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={resetStorage}>
        <Text style={styles.text}>Reset</Text>
      </Pressable>

      <FlatList
        style={{ width: '100%' }}
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openStorage(item.id)}>
            <View style={styles.row}>
              <Text>Storage {item.id + 1}</Text>
              <Text>{item.parcelStored}/5</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.')
          setModalVisible(!modalVisible)
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {displayParcel != null ? displayParcel.subStorage.map(function (item, index) {
              return (
                <View style={styles.displayParcel}>
                  <Text style={styles.header}>Parcel #{index + 1}</Text>
                  <Text key={index}>Name: {item.name}{"\n"}House Number: {item.houseNumber}{"\n"}Date: {item.date}</Text>
                </View>
              )
            }) : <Text>Storage Empty</Text>}

            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.textStyle}>Hide Modal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    width: 300,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },

  row: {
    flex: 1,
    paddingVertical: 25,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'grey',
    margin: 10,
  },

  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'black',
    margin: 5,
  },

  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },

  containerLoading: {
    flex: 1,
    justifyContent: 'center',
  },

  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },

  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  displayParcel: {
    marginBottom: 20,
  },

  buttonOpen: {
    backgroundColor: '#F194FF',
  },

  buttonClose: {
    backgroundColor: '#2196F3',
  },

  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
})
