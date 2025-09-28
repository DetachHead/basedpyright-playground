/*
 * Copyright (c) Eric Traut
 * A button that displays an icon and handles press and hover events.
 */

import { Pressable, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { useHover } from './HoverHook';
import { useTheme, ThemeColors } from './ThemeContext';

interface PushButtonProps {
    label: string;
    disabled?: boolean;
    title?: string;
    backgroundStyle?: ViewStyle | ViewStyle[];
    textStyle?: TextStyle;
    hoverBackgroundStyle?: ViewStyle | ViewStyle[];
    hoverTextStyle?: TextStyle;
    onPress: () => void;
}

export default function PushButton(props: PushButtonProps) {
    const { colors } = useTheme();
    const [hoverRef, isHovered] = useHover();
    const styles = makeStyles(colors);

    let effectiveBackgroundStyle: (ViewStyle | ViewStyle[] | undefined)[] = [
        styles.defaultBackground,
        props.backgroundStyle,
    ];
    let effectiveTextStyle: (TextStyle | undefined)[] = [props.textStyle];

    if (props.disabled) {
        effectiveBackgroundStyle.push(styles.disabledBackground);
        effectiveTextStyle.push(styles.disabledText);
    } else if (isHovered) {
        effectiveBackgroundStyle.push(styles.defaultHoverBackground, props.hoverBackgroundStyle);
        effectiveTextStyle.push(props.hoverTextStyle);
    }

    return (
        <div title={props.title}>
            <Pressable
                ref={hoverRef}
                onPress={props.onPress}
                disabled={props.disabled}
                style={[styles.baseBackground, effectiveBackgroundStyle]}
            >
                <Text
                    style={[styles.baseText, effectiveTextStyle]}
                    selectable={false}
                    numberOfLines={1}
                >
                    {props.label}
                </Text>
            </Pressable>
        </div>
    );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
    baseBackground: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.accent,
    },
    defaultBackground: {
        backgroundColor: colors.surface,
    },
    defaultHoverBackground: {
        backgroundColor: colors.background,
    },
    disabledBackground: {
        backgroundColor: 'transparent',
        borderColor: colors.textSecondary,
    },
    disabledText: {
        color: colors.textSecondary,
    },
    baseText: {
        color: colors.text,
        fontSize: 13,
    },
});
