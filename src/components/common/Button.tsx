import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? theme.colors.primary : theme.colors.white}
          size="small"
        />
      ) : (
        <Text style={textStyleCombined}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minWidth: 120,
    ...theme.shadows.sm,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  danger: {
    backgroundColor: theme.colors.error,
  },
  small: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    minHeight: 36,
  },
  medium: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 44,
  },
  large: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    minHeight: 52,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontWeight: theme.fontWeight.semibold,
    textAlign: 'center',
  },
  primaryText: {
    color: theme.colors.white,
  },
  secondaryText: {
    color: theme.colors.white,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  dangerText: {
    color: theme.colors.white,
  },
  smallText: {
    fontSize: theme.fontSize.sm,
  },
  mediumText: {
    fontSize: theme.fontSize.md,
  },
  largeText: {
    fontSize: theme.fontSize.lg,
  },
  disabledText: {
    opacity: 0.8,
  },
});
