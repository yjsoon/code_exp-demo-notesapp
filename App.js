import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Button,
  TextInput,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Entypo } from "@expo/vector-icons";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("notes.db");
const SAMPLE_NOTES = [
  { title: "Walk the cat", id: "0", done: false },
  { title: "Water the cat", id: "1", done: false },
  { title: "Buy the milk", id: "2", done: false },
  { title: "Water the milk", id: "3", done: false },
];

function NotesScreen({ route, navigation }) {
  const [notes, setNotes] = useState(SAMPLE_NOTES);

  function refreshNotes() {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM notes",
        null,
        (txObj, { rows: { _array } }) => setNotes(_array),
        (txObj, error) => console.log("Error ", error)
      );
    });
  }

  // Create the DB on first run
  useEffect(() => {
    db.transaction(
      (tx) => {
        tx.executeSql(`
        CREATE TABLE IF NOT EXISTS notes
        (id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          done INT);
      `);
      },
      null,
      refreshNotes
    );
  }, []);

  // Adds the + button in the top right
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate("Add")}>
          <Entypo
            style={{ marginRight: 10 }}
            name="new-message"
            size={24}
            color="black"
          />
        </TouchableOpacity>
      ),
    });
  });

  // Responds to coming back from the add screen
  useEffect(() => {
    if (route.params?.todoText) {
      // const newNote = {
      //   title: route.params.todoText,
      //   id: notes.length.toString(),
      //   done: false,
      // };
      // setNotes([...notes, newNote]);
      db.transaction(
        (tx) => {
          tx.executeSql("INSERT INTO notes (done, title) VALUES (0, ?)", [
            route.params.todoText,
          ]);
        },
        null,
        refreshNotes
      );
    }
  }, [route.params?.todoText]);

  function renderItem({ item }) {
    return (
      <View style={styles.listItem}>
        <Text>{item.title}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList style={styles.list} data={notes} renderItem={renderItem} />
    </View>
  );
}

function AddScreen({ navigation }) {
  const [todoText, setTodoText] = useState("");

  return (
    <View style={styles.container}>
      <Text>Add your note</Text>
      <TextInput
        style={styles.textInput}
        onChangeText={(text) => setTodoText(text)}
      />
      <Button
        onPress={() => navigation.navigate("Notes", { todoText })}
        title="Submit"
      />
      <Button onPress={() => navigation.goBack()} title="Cancel" />
      <Text>{todoText}</Text>
    </View>
  );
}

const NotesStack = createStackNavigator();

function NotesStackScreen() {
  return (
    <NotesStack.Navigator>
      <NotesStack.Screen
        name="Notes"
        component={NotesScreen}
        options={{
          headerTitle: "Notes App",
          headerTitleStyle: styles.headerTitleStyle,
          headerStyle: styles.headerStyle,
        }}
      />
    </NotesStack.Navigator>
  );
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator mode="modal" headerMode="none">
        <Stack.Screen
          name="NotesStack"
          component={NotesStackScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Add" component={AddScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#cdd",
  },
  headerTitleStyle: {
    fontWeight: "bold",
    fontSize: 30,
  },
  headerStyle: {
    height: 80,
    backgroundColor: "#aa9",
    borderBottomWidth: 3,
    borderBottomColor: "green",
  },
  list: {
    width: "100%",
  },
  listItem: {
    height: 50,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#999",
    paddingLeft: 20,
  },
  textInput: {
    borderColor: "black",
    padding: 5,
    backgroundColor: "white",
    marginTop: 10,
    width: "90%",
  },
});
