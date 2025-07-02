import { getColors } from '@/functions/common';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RadioButtonGroup({ options, selected, onSelect }: { options: {label: string, value: string}[], selected: string, onSelect: (value: string) => void }) {

  const themeColors = getColors();
  const styles = StyleSheet.create({
    groupContainer: {
      flexDirection: 'row',
      alignSelf: 'center',
    },
    button: {
      borderWidth: 1,
      borderColor: themeColors.border,
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: themeColors.button.tertiary.background,
    },
    buttonNoRightBorder: {
      borderRightWidth: 0,
    },
    firstButton: {
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
    },
    lastButton: {
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
    },
    selectedButton: {
      backgroundColor: themeColors.background,
    },
    buttonText: {
      color: themeColors.text,
      fontWeight: '500',
    },
    selectedText: {
      color: themeColors.text,
    },
  });


  return (
    <View style={styles.groupContainer}>
      {options.map((option, index) => {
        const isFirst = index === 0;
        const isLast = index === options.length - 1;
        const isSelected = selected === option.value;

        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={[
              styles.button,
              isFirst && styles.firstButton,
              isLast && styles.lastButton,
              isSelected && styles.selectedButton,
              // Remove right border for all except last for seamless joining
              !isLast && styles.buttonNoRightBorder,
            ]}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, isSelected && styles.selectedText]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
