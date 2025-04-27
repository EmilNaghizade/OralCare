import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const SupportModal = ({ visible, onClose }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    console.log("Support Message:", message);
    // Burada mesajı backend'e post edebilirsin
    onClose();
    setMessage("");
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Support Message</Text>
          <TextInput
            placeholder="Type your message..."
            value={message}
            onChangeText={setMessage}
            style={styles.input}
            multiline
          />
          <TouchableOpacity style={styles.button} onPress={handleSend}>
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    height: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  cancelButton: {
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#007AFF",
  },
});

export default SupportModal;
