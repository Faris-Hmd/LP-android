import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontFamily: 'Cairo-Medium',
    fontSize: 12,
    lineHeight: 20,
  },
  smallBold: {
    fontFamily: 'Cairo-Bold',
    fontSize: 12,
    lineHeight: 20,
  },
  default: {
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    lineHeight: 24,
  },
  title: {
    fontFamily: 'Cairo-Bold',
    fontSize: 34,
    lineHeight: 44,
  },
  subtitle: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 22,
    lineHeight: 32,
  },
  link: {
    fontFamily: 'Cairo-Medium',
    lineHeight: 30,
    fontSize: 12,
  },
  linkPrimary: {
    fontFamily: 'Cairo-Medium',
    lineHeight: 30,
    fontSize: 12,
    color: '#3c87f7',
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 10,
  },
});
