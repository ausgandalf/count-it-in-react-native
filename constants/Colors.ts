/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#ffffff';

export const Colors = {
  light: {
    text: '#11181C',
    label: '#3b82f6',
    background: '#ffffff',
    border: '#eeeeee',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    checkbox: {
      color: '#eeeeee',
    },
    input: {
      background: '#ffffff',
      borderColor: '#dddddd',
      color: '#000000',
      placeholder: '#555555',
    },
    button: {
      primary: {
        background: '#4CAF50',
        color: '#ffffff',
      },
      secondary: {
        background: '#2196F3',
        color: '#ffffff',
      },
      tertiary: {
        background: '#999',
        color: '#111',
      },
      danger: {
        background: '#f87171',
        color: '#ffffff',
      },
      disabled: {
        background: '#666666',
        color: '#ffffff',
      }
    },
    list: {
      item: {
        background: '#ccc',
        color: '#111',
      },
      selected: {
        background: '#325934',
        color: '#fff',
      }
    }
  },
  dark: {
    text: '#ECEDEE',
    label: '#ffff00',
    background: '#222222',
    border: '#333333',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    checkbox: {
      color: '#398c71',
    },
    input: {
      background: '#555555',
      borderColor: '#444444',
      color: '#ffffff',
      placeholder: '#999999',
    },
    button: {
      primary: {
        background: '#4CAF50',
        color: '#ffffff',
      },
      secondary: {
        background: '#2196F3',
        color: '#ffffff',
      },
      tertiary: {
        background: '#444444',
        color: '#ffffff',
      },
      danger: {
        background: '#f44336',
        color: '#ffffff',
      },
      disabled: {
        background: '#666666',
        color: '#ffffff',
      }
    },
    list: {
      item: {
        background: '#444',
        color: '#fff',
      },
      selected: {
        background: '#325934',
        color: '#fff',
      }
    },
  },
};
