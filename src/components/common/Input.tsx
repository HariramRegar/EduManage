import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../constants/theme';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  required = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  disabled = false,
  style,
  inputStyle,
  rightIcon,
  onRightIconPress,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyle = [
    styles.container,
    style,
  ];

  const inputContainerStyle = [
    styles.inputContainer,
    isFocused && styles.focused,
    error && styles.error,
    disabled && styles.disabled,
  ];

  const inputStyleCombined = [
    styles.input,
    multiline && styles.multilineInput,
    disabled && styles.disabledInput,
    inputStyle,
  ];

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View style={inputContainerStyle}>
        <TextInput
          style={inputStyleCombined}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textLight}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          secureTextEntry={secureTextEntry}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  required: {
    color: theme.colors.error,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  focused: {
    borderColor: theme.colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  error: {
    borderColor: theme.colors.error,
  },
  disabled: {
    backgroundColor: theme.colors.surfaceVariant,
    borderColor: theme.colors.borderLight,
  },
  input: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    minHeight: 48,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  disabledInput: {
    color: theme.colors.textLight,
  },
  rightIcon: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  errorText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});
