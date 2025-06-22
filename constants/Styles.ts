import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StyleSheet, useWindowDimensions } from 'react-native';

export const getCommonStyles = () => {
  const colorScheme = useColorScheme();
  const { width: windowWidth } = useWindowDimensions();
  
  return StyleSheet.create({
    bg: {
      backgroundColor: Colors[colorScheme ?? 'light'].background,
    },
    sub: {
      backgroundColor: Colors[colorScheme ?? 'light'].border,
      padding: 20,
      borderRadius: 8,
    },
    icon: {
      marginHorizontal: 8,
      width: 16,
    },
    text: {
      color: Colors[colorScheme ?? 'light'].text,
      flex: 1,
      marginLeft: 10,
      fontSize: 16,
    },
    full: {
      width: '100%',
    },
    selectBox: {
      backgroundColor: Colors[colorScheme ?? 'light'].button.tertiary.background,
      borderColor: Colors[colorScheme ?? 'light'].input.borderColor,
      borderWidth: 1,
      borderRadius: 8,
      color: Colors[colorScheme ?? 'light'].input.color,
    },
    selectItem: {
      backgroundColor: Colors[colorScheme ?? 'light'].input.background,
      borderColor: Colors[colorScheme ?? 'light'].input.borderColor,
      borderWidth: 1,
      borderRadius: 8,
      color: Colors[colorScheme ?? 'light'].input.color,
    },
    inputText: {
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'light'].input.borderColor,
      backgroundColor: Colors[colorScheme ?? 'light'].input.background,
      color: Colors[colorScheme ?? 'light'].input.color,
      borderRadius: 8,
      padding: 10,
      marginTop: 5,
    },
    checkbox: {
      width: 20,
      height: 20,
      marginRight: 6,
      borderColor: Colors[colorScheme ?? 'light'].border,
      backgroundColor: Colors[colorScheme ?? 'light'].checkbox.color,
    },
    button: {
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: (windowWidth < 380) ? 20 : 24,
    },
    buttonSm: {
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: (windowWidth < 380) ? 8 : 10,
    },
    primaryButton: {
      backgroundColor: Colors[colorScheme ?? 'light'].button.primary.background,
      color: Colors[colorScheme ?? 'light'].button.primary.color,
    },
    secondaryButton: {
      backgroundColor: Colors[colorScheme ?? 'light'].button.secondary.background,
      color: Colors[colorScheme ?? 'light'].button.secondary.color,
    },
    tertiaryButton: {
      backgroundColor: Colors[colorScheme ?? 'light'].button.tertiary.background,
      color: Colors[colorScheme ?? 'light'].button.tertiary.color,
    },
    dangerButton: {
      backgroundColor: Colors[colorScheme ?? 'light'].button.danger.background,
      color: Colors[colorScheme ?? 'light'].button.danger.color,
    },
    disabledButton: {
      backgroundColor: Colors[colorScheme ?? 'light'].button.disabled.background,
      color: Colors[colorScheme ?? 'light'].button.disabled.color,
    },
    buttonText: {
      color: Colors[colorScheme ?? 'light'].text,
      fontSize: 16,
      textAlign: 'center',
    },
    triangle: {
      position: 'absolute',
      right: 16,
      top: '50%',
      transform: [{ translateY: -8 }],
      color: Colors[colorScheme ?? 'light'].text,
      fontSize: 14,
    },
    modal: {
      margin: 0
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.2)',
      justifyContent: 'flex-end',
      alignItems: 'center',
      pointerEvents: 'box-none',
      width: '100%',
    },
    modalBox: {
      backgroundColor: Colors[colorScheme ?? 'light'].background,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      width: '100%',
    },
    item: {
      backgroundColor: Colors[colorScheme ?? 'light'].list.item.background,
      color: Colors[colorScheme ?? 'light'].list.item.color,
    },
    selected: {
      backgroundColor: Colors[colorScheme ?? 'light'].list.selected.background,
      color: Colors[colorScheme ?? 'light'].list.selected.color,
    }
  });
}