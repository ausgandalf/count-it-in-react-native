import { getColors } from '@/functions/common';
import { StyleSheet, useWindowDimensions } from 'react-native';

export const getCommonStyles = () => {
  const { width: windowWidth } = useWindowDimensions();
  const themeColors = getColors();
  return StyleSheet.create({
    container: {
      backgroundColor: themeColors.background,
      flex: 1,
      gap: 20,
      padding: 20,
      margin: 0,
    },
    wrap: {
      alignItems: 'center',
      flex: 1,
    },
    body: {
      flex: 1,
      gap: 20,
      // maxWidth: windowWidth < 768 ? '100%' : 600,
      maxWidth: 600,
      width: '100%',
    },
    bg: {
      backgroundColor: themeColors.background,
    },
    sub: {
      backgroundColor: themeColors.subBackground,
      padding: 20,
      borderRadius: 8,
    },
    icon: {
      marginHorizontal: 8,
      width: 16,
    },
    text: {
      color: themeColors.text,
      flex: 1,
      marginLeft: 10,
      fontSize: 16,
    },
    link: {
      lineHeight: 30,
      fontSize: 16,
      color: themeColors.link,
    },
    full: {
      width: '100%',
    },
    roundBordered: {
      borderColor: themeColors.border,
      borderWidth: 1,
      borderRadius: 8,
    },
    roundBorderedSm: {
      borderColor: themeColors.border,
      borderWidth: 1,
      borderRadius: 4,
    },
    selectBox: {
      backgroundColor: themeColors.button.tertiary.background,
      borderColor: themeColors.input.borderColor,
      borderWidth: 1,
      borderRadius: 8,
      color: themeColors.input.color,
    },
    selectItem: {
      backgroundColor: themeColors.input.background,
      borderColor: themeColors.input.borderColor,
      borderWidth: 1,
      borderRadius: 8,
      color: themeColors.input.color,
    },
    inputText: {
      borderWidth: 1,
      borderColor: themeColors.input.borderColor,
      backgroundColor: themeColors.input.background,
      color: themeColors.input.color,
      borderRadius: 8,
      padding: 10,
      marginTop: 5,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderColor: themeColors.border,
      backgroundColor: themeColors.checkbox.color,
    },
    buttonGroup: {
      flexDirection: (windowWidth < 320) ? 'column' : 'row',
      gap: 10,
      justifyContent: 'center',
    },
    button: {
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: (windowWidth < 380) ? 16 : 20,
      borderWidth: 1,
      borderColor: themeColors.input.borderColor, 
    },
    buttonSm: {
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: (windowWidth < 380) ? 8 : 10,
      borderWidth: 1,
      borderColor: themeColors.input.borderColor,
    },
    primaryButton: {
      backgroundColor: themeColors.button.primary.background,
      color: themeColors.button.primary.color,
    },
    secondaryButton: {
      backgroundColor: themeColors.button.secondary.background,
      color: themeColors.button.secondary.color,
    },
    tertiaryButton: {
      backgroundColor: themeColors.button.tertiary.background,
      color: themeColors.button.tertiary.color,
    },
    dangerButton: {
      backgroundColor: themeColors.button.danger.background,
      color: themeColors.button.danger.color,
    },
    disabledButton: {
      backgroundColor: themeColors.button.disabled.background,
      color: themeColors.button.disabled.color,
      opacity: 0.5,
    },
    buttonText: {
      color: themeColors.text,
      fontSize: 16,
      textAlign: 'center',
    },
    triangle: {
      position: 'absolute',
      right: 16,
      top: '50%',
      transform: [{ translateY: -8 }],
      color: themeColors.text,
      fontSize: 14,
    },
    modal: {
      margin: 0,
      zIndex: 1000,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.2)',
      justifyContent: 'flex-end',
      alignItems: 'center',
      pointerEvents: 'box-none',
      width: '100%',
      padding: 20,
    },
    modalBox: {
      backgroundColor: themeColors.background,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      width: '100%',
      maxWidth: 600,
    },
    item: {
      backgroundColor: themeColors.list.item.background,
      color: themeColors.list.item.color,
    },
    selected: {
      backgroundColor: themeColors.list.selected.background,
      color: themeColors.list.selected.color,
    },
    boxShadow: {
      // iOS
      boxShadow: [
        {
          offsetX: 0,
          offsetY: 4,
          blurRadius: 6,
          color: 'rgba(0, 0, 0, 0.1)',
        },
      ],
      // Android
      elevation: 5,
    },
  });
}