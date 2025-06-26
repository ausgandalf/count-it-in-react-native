/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#ffffff';

export const Colors = {
  light: {
    danger: '#8f2424',
    text: '#11181C',
    link: '#2b8b00',
    label: '#3b82f6',
    background: '#cdd7df',
    deepBackground: '#abbdcb',
    subBackground: '#b1c2d1',
    border: '#8a939b',
    borderLight: '#afb9c1',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    checkbox: {
      color: '#6c859b',
    },
    input: {
      background: '#ffffff',
      borderColor: '#a9b6c1',
      color: '#000000',
      placeholder: '#555555',
    },
    button: {
      primary: {
        background: '#71c775',
        color: '#ffffff',
      },
      secondary: {
        background: '#2196F3',
        color: '#ffffff',
      },
      tertiary: {
        background: '#b1c2d1',
        color: '#111',
      },
      danger: {
        background: '#f87171',
        color: '#ffffff',
      },
      disabled: {
        background: '#a1a9af',
        color: '#ffffff',
      }
    },
    list: {
      item: {
        background: '#c0cbd4',
        color: '#111',
      },
      selected: {
        background: '#82bb85',
        color: '#fff',
      }
    },
    beat: {
      first: '#2196f3',
      active: '#5cbb60',
      inactive: '#a9b2b9',
    }
  },
  dark: {
    danger: '#8f2424',
    text: '#ECEDEE',
    link: '#40cf00',
    label: '#ffff00',
    background: '#222222',
    deepBackground: '#121212',
    subBackground: '#333333',
    border: '#333333',
    borderLight: '#444444',
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
    beat: {
      first: '#ffffff',
      active: '#90ee90',
      inactive: '#444',
    }
  },
};
