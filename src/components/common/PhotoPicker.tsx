import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../constants/theme';

interface PhotoPickerProps {
  label?: string;
  value?: string;
  onChange: (uri: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

const PhotoPicker: React.FC<PhotoPickerProps> = ({
  label,
  value,
  onChange,
  required = false,
  error,
  placeholder = 'Tap to select photo',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to select photos!'
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);

    try {
      console.log('Launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for passport photos
        quality: 0.8,
        base64: false,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        console.log('Selected image URI:', result.assets[0].uri);
        onChange(result.assets[0].uri);
      } else {
        console.log('Image selection was canceled or no assets');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', `Failed to select image: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);

    try {
      console.log('Launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for passport photos
        quality: 0.8,
        base64: false,
      });

      console.log('Camera result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        console.log('Captured image URI:', result.assets[0].uri);
        onChange(result.assets[0].uri);
      } else {
        console.log('Camera was canceled or no assets');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', `Failed to take photo: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const showImageOptions = () => {
    console.log('Showing image options dialog');
    Alert.alert(
      'Select Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const removePhoto = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onChange('') },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={styles.photoContainer}>
        {value ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: value }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={removePhoto}
              activeOpacity={0.7}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.placeholder, error && styles.placeholderError]}
            onPress={() => {
              console.log('PhotoPicker placeholder pressed');
              showImageOptions();
            }}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Text style={styles.placeholderText}>
              {isLoading ? 'Loading...' : placeholder}
            </Text>
            <Text style={styles.placeholderSubtext}>
              Tap to select from camera or gallery
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.sm,
  },
  required: {
    color: theme.colors.error,
  },
  photoContainer: {
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primaryBackground,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  removeButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: theme.fontWeight.bold,
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primaryBackground,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  placeholderError: {
    borderColor: theme.colors.error,
  },
  placeholderText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.accent,
    fontWeight: theme.fontWeight.medium,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  placeholderSubtext: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.secondaryText,
    textAlign: 'center',
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});

export default PhotoPicker;
