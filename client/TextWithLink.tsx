/*
 * Copyright (c) Eric Traut
 * View that displays text as a link that opens a URL.
 */

import { Linking, StyleProp, StyleSheet, Text, TextStyle } from 'react-native';
import { useHover } from './HoverHook';
import { useTheme, ThemeColors } from './ThemeContext';

interface TextWithLinkProps extends React.PropsWithChildren {
    style?: StyleProp<TextStyle>;
    url: string;
    useSameWindow?: boolean;
}

export default function TextWithLink(props: TextWithLinkProps) {
    const { colors } = useTheme();
    const [hoverRef, isHovered] = useHover();
    const styles = makeStyles(colors);

    return (
        <Text
            ref={hoverRef}
            style={[styles.default, props.style, isHovered ? styles.defaultHover : undefined]}
            onPress={(event) => {
                if (props.useSameWindow && !(event as any).metaKey) {
                    history.pushState(null, '', window.location.href);
                    window.location.replace(props.url);
                } else {
                    Linking.openURL(props.url);
                }
            }}
        >
            {props.children}
        </Text>
    );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
    default: {
        color: colors.accent,
    },
    defaultHover: {
        color: colors.text,
    },
});
