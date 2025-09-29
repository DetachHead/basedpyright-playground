/*
 * Copyright (c) Eric Traut
 * Provides rendering of (and interaction with) a menu of options.
 */

import { IconDefinition } from '@ant-design/icons-svg/lib/types';
import React, { ForwardedRef, forwardRef, useImperativeHandle, useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import {
    MenuOption,
    MenuOptions,
    MenuTrigger,
    Menu as RNMenu,
    renderers,
} from 'react-native-popup-menu';
import { useHover } from './HoverHook';
import { SvgIcon } from './SvgIcon';
import { useTheme, ThemeColors, Theme } from './ThemeContext';

export interface MenuProps extends React.PropsWithChildren {
    name: string;
    onOpen?: () => void;
    isPopup?: boolean;
}

export interface MenuRef {
    open: () => void;
    close: () => void;
}

export const Menu = forwardRef(function Menu(props: MenuProps, ref: ForwardedRef<MenuRef>) {
    const { colors, theme } = useTheme();
    const menuRef = useRef<RNMenu>(null);
    const styles = makeStyles(colors);

    useImperativeHandle(ref, () => {
        return {
            open: () => {
                menuRef.current?.open();
            },
            close: () => {
                menuRef.current?.close();
            },
        };
    });

    return (
        <RNMenu
            key={props.name}
            name={props.name}
            ref={menuRef}
            renderer={renderers.Popover}
            onOpen={props.onOpen}
            rendererProps={{ anchorStyle: { width: 0, height: 0, backgroundColor: 'transparent' } }}
        >
            <MenuTrigger />
            <MenuOptions
                customStyles={{
                    optionsContainer: {
                        backgroundColor: 'transparent',
                        shadowOpacity: 0,
                    },
                }}
            >
                <View style={styles.menuContainer}>{props.children}</View>
            </MenuOptions>
        </RNMenu>
    );
});

export interface MenuItemProps {
    label: string;
    labelFilterText?: string;
    title?: string;
    iconDefinition?: IconDefinition;
    disabled?: boolean;
    focused?: boolean;
    onSelect?: () => void;
}

export function MenuItem(props: MenuItemProps) {
    const { colors, theme } = useTheme();
    const [hoverRef, isHovered] = useHover();
    const styles = makeStyles(colors);

    // If there's a label filter, see if we can find it in the label.
    let filterOffset = -1;
    if (props.labelFilterText) {
        filterOffset = props.label.toLowerCase().indexOf(props.labelFilterText);
    }

    let labelItem: JSX.Element | undefined;

    if (filterOffset < 0) {
        labelItem = (
            <Text style={[styles.labelText, styles.labelText]} numberOfLines={1} selectable={false}>
                {props.label}
            </Text>
        );
    } else {
        const beforeText = props.label.substring(0, filterOffset);
        const middleText = props.label.substring(
            filterOffset,
            filterOffset + props.labelFilterText.length
        );
        const afterText = props.label.substring(filterOffset + props.labelFilterText.length);

        labelItem = (
            <Text style={styles.labelText} numberOfLines={1} selectable={false}>
                <Text selectable={false}>{beforeText}</Text>
                <Text style={styles.labelFiltered} selectable={false}>
                    {middleText}
                </Text>
                <Text selectable={false}>{afterText}</Text>
            </Text>
        );
    }

    return (
        <MenuOption
            onSelect={props.onSelect}
            customStyles={{ optionWrapper: { padding: 0 } }}
            disabled={props.disabled}
            disableTouchable={props.disabled}
        >
            <div title={props.title}>
                <View
                    style={[
                        styles.container,
                        (props.focused || isHovered) && !props.disabled
                            ? styles.focused
                            : undefined,
                        props.disabled ? styles.disabled : undefined,
                    ]}
                    ref={hoverRef}
                >
                    <View style={styles.iconContainer}>
                        {props.iconDefinition ? (
                            <SvgIcon
                                iconDefinition={props.iconDefinition}
                                iconSize={14}
                                color={props.iconDefinition ? colors.accent : 'transparent'}
                            />
                        ) : undefined}
                    </View>
                    {labelItem}
                </View>
            </div>
        </MenuOption>
    );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        paddingVertical: 2,
        paddingHorizontal: 6,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 4,
        ...Platform.select({ web: {
            cursor: 'default',
        }})
    },
    disabled: {
        ...Platform.select({ web: {
            cursor: 'default',
        }}),
        opacity: 0.5,
    },
    iconContainer: {
        minWidth: 14,
        marginLeft: 2,
        marginRight: 4,
    },
    focused: {
        backgroundColor: colors.hover,
    },
    menuContainer: {
        margin: 4,
        backgroundColor: colors.background,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    labelText: {
        fontSize: 13,
        padding: 4,
        color: colors.text,
    },
    labelFiltered: {
        backgroundColor: colors.accent,
        color: colors.background,
    },
});
