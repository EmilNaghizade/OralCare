
  // frontend/admin/components/VideoForm.jsx
  import React, { useState, useEffect } from 'react';
  import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    TouchableOpacity, 
    ScrollView,
    Alert,
    ActivityIndicator
  } from 'react-native';
  import { useAuth } from '../../_layout';
  import * as ImagePicker from 'expo-image-picker';
  import { Ionicons } from '@expo/vector-icons';
  
  export default function VideoForm({ route, navigation }) {
    const { isEditing, videoId } = route.params;
    const { authToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      tags: [],
      videoUrl: null,
      thumbnailUrl: null,
    });
    
    const [tagInput, setTagInput] = useState('');
  
    useEffect(() => {
      if (isEditing && videoId) {
        fetchVideoDetails();
      }
    }, [isEditing, videoId]);
  
    const fetchVideoDetails = async () => {
      setLoading(true);
      try {
        // Replace with your actual API call
        // const response = await fetch(`your-api-endpoint/${videoId}`, {
        //   headers: { Authorization: `Bearer ${authToken}` }
        // });
        // const data = await response.json();
        
        // Dummy data for now
        const dummyData = {
          title: 'Brushing Techniques',
          description: 'How to brush teeth properly',
          tags: ['education', 'tutorial'],
          videoUrl: 'url',
          thumbnailUrl: 'url',
        };
        
        setFormData(dummyData);
      } catch (error) {
        console.error('Error fetching video details:', error);
        Alert.alert('Error', 'Failed to load video details');
      } finally {
        setLoading(false);
      }
    };
  
    const handleInputChange = (name, value) => {
      setFormData({
        ...formData,
        [name]: value
      });
    };
  
    const addTag = () => {
      if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tagInput.trim()]
        });
        setTagInput('');
      }
    };
  
    const removeTag = (tag) => {
      setFormData({
        ...formData,
        tags: formData.tags.filter(t => t !== tag)
      });
    };
  
    const pickVideo = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant media library permissions to upload a video.');
        return;
      }
      
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: true,
          quality: 1,
        });
        
        if (!result.canceled && result.assets && result.assets[0]) {
          const videoUri = result.assets[0].uri;
          setFormData({
            ...formData,
            videoUrl: videoUri
          });
        }
      } catch (error) {
        console.error('Error picking video:', error);
      }
    };
  
    const pickThumbnail = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant media library permissions to upload a thumbnail.');
        return;
      }
      
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [16, 9],
          quality: 1,
        });
        
        if (!result.canceled && result.assets && result.assets[0]) {
          const imageUri = result.assets[0].uri;
          setFormData({
            ...formData,
            thumbnailUrl: imageUri
          });
        }
      } catch (error) {
        console.error('Error picking thumbnail:', error);
      }
    };
  
    const handleSubmit = async () => {
      // Validate form
      if (!formData.title || !formData.description || formData.tags.length === 0) {
        Alert.alert('Missing Information', 'Please fill in all required fields');
        return;
      }
      
      if (!isEditing && !formData.videoUrl) {
        Alert.alert('Missing Video', 'Please upload a video file');
        return;
      }
      
      setSubmitting(true);
      
      try {
        // Replace with your actual API call
        // For new video
        // if (!isEditing) {
        //   await fetch('your-api-endpoint', {
        //     method: 'POST',
        //     headers: { 
        //       'Content-Type': 'application/json',
        //       Authorization: `Bearer ${authToken}`
        //     },
        //     body: JSON.stringify(formData)
        //   });
        // } else {
        //   // For updating existing video
        //   await fetch(`your-api-endpoint/${videoId}`, {
        //     method: 'PUT',
        //     headers: { 
        //       'Content-Type': 'application/json',
        //       Authorization: `Bearer ${authToken}`
        //     },
        //     body: JSON.stringify(formData)
        //   });
        // }
        
        // Success message
        Alert.alert(
          'Success', 
          isEditing ? 'Video updated successfully' : 'Video created successfully',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } catch (error) {
        console.error('Error saving video:', error);
        Alert.alert('Error', 'Failed to save video');
      } finally {
        setSubmitting(false);
      }
    };
  
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }
  
    return (
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => handleInputChange('title', text)}
            placeholder="Enter video title"
          />
          
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
            placeholder="Enter video description"
            multiline={true}
            numberOfLines={4}
          />
          
          <Text style={styles.label}>Tags *</Text>
          <View style={styles.tagsContainer}>
            {formData.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => removeTag(tag)}>
                  <Ionicons name="close-circle" size={16} color="#8E8E93" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Add a tag"
            />
            <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
              <Text style={styles.addTagButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.label}>Video *</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={pickVideo}>
            <Ionicons name="cloud-upload-outline" size={24} color="#007AFF" />
            <Text style={styles.uploadButtonText}>
              {formData.videoUrl ? 'Change Video' : 'Upload Video'}
            </Text>
          </TouchableOpacity>
          
          {formData.videoUrl && (
            <Text style={styles.fileSelected}>
              Video selected: {formData.videoUrl.split('/').pop()}
            </Text>
          )}
          
          <Text style={styles.label}>Thumbnail</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={pickThumbnail}>
            <Ionicons name="image-outline" size={24} color="#007AFF" />
            <Text style={styles.uploadButtonText}>
              {formData.thumbnailUrl ? 'Change Thumbnail' : 'Upload Thumbnail'}
            </Text>
          </TouchableOpacity>
          
          {formData.thumbnailUrl && (
            <Text style={styles.fileSelected}>
              Thumbnail selected: {formData.thumbnailUrl.split('/').pop()}
            </Text>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
              disabled={submitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditing ? 'Update Video' : 'Save Video'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F2F2F7',
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    formContainer: {
      padding: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
      marginTop: 16,
    },
    input: {
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 8,
    },
    tag: {
      backgroundColor: '#E5E5EA',
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
      margin: 4,
      flexDirection: 'row',
      alignItems: 'center',
    },
    tagText: {
      marginRight: 6,
    },
    tagInputContainer: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    tagInput: {
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      flex: 1,
      marginRight: 8,
    },
    addTagButton: {
      backgroundColor: '#007AFF',
      borderRadius: 8,
      padding: 12,
      justifyContent: 'center',
    },
    addTagButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    uploadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
    },
    uploadButtonText: {
      marginLeft: 8,
      fontSize: 16,
      color: '#007AFF',
    },
    fileSelected: {
      marginTop: 8,
      fontSize: 14,
      color: '#8E8E93',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 32,
      marginBottom: 40,
    },
    button: {
      borderRadius: 8,
      padding: 16,
      width: '48%',
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: '#E5E5EA',
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#8E8E93',
    },
    submitButton: {
      backgroundColor: '#007AFF',
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: 'white',
    },
  });