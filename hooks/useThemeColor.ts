/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { SettingsType } from '@/constants/Settings';
import { useSettings } from '@/context/SettingsContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const {settings} = useSettings()! as {settings: SettingsType, setSettings: (settings: SettingsType) => void};
  let theme = useColorScheme() ?? 'dark';
  if (settings && settings.theme != '') theme = settings.theme;

  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
