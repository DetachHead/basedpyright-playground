/*
 * Copyright (c) Eric Traut
 * An icon rendered using an SVG image.
 */

import { renderIconDefinitionToSVGElement } from '@ant-design/icons-svg/es/helpers';
import { IconDefinition } from '@ant-design/icons-svg/lib/types';
import { Platform, StyleSheet, View } from 'react-native';

export interface SvgIconProps {
    iconDefinition: IconDefinition;
    iconSize: number;
    color: string;
}

export function SvgIcon(props: SvgIconProps) {
    const svgElement = renderIconDefinitionToSVGElement(props.iconDefinition, {
        extraSVGAttrs: {
            width: `${props.iconSize}px`,
            height: `${props.iconSize}px`,
            fill: props.color,
        },
    });

    return (
        <View style={styles.container}>
            <div
                style={{
                    display: 'flex',
                    height: props.iconSize,
                    width: props.iconSize,
                    ...styles.iconContainer,
                }}
                dangerouslySetInnerHTML={{ __html: svgElement }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    defaultBackgroundStyle: {
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    container: {
        flex: -1,
        justifyContent: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabled: {
        opacity: 1,
        ...Platform.select({ web: {
            cursor: 'default',
        }})
    },
});
