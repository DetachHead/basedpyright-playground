/*
 * Copyright (c) Eric Traut
 * Header bar with embedded controls for the playground.
 */

import * as icons from '@ant-design/icons-svg';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAssets } from 'expo-asset';
import IconButton from './IconButton';
import { RightPanelType } from './RightPanel';
import { useTheme, ThemeColors } from './ThemeContext';

const headerIconButtonSize = 20;

export interface HeaderPanelProps {
    isRightPanelDisplayed: boolean;
    rightPanelType: RightPanelType;
    onShowRightPanel: (rightPanelType?: RightPanelType) => void;
}

export function HeaderPanel(props: HeaderPanelProps) {
    const { colors } = useTheme();
    const [assets, error] = useAssets([require('./assets/pyright_bw.png')]);
    const styles = makeStyles(colors);

    let image = null;
    if (!error && assets) {
        image = <Image style={styles.pyrightIcon} source={assets[0]} />;
    } else {
        image = <View style={styles.pyrightIcon} />;
    }

    return (
        <View style={styles.container}>
            <Pressable
                onPress={() => {
                    Linking.openURL('https://docs.basedpyright.com');
                }}
            >
                {image}
            </Pressable>
            <Text style={styles.titleText} selectable={false}>
                BasedPyright Playground
            </Text>
            <View style={styles.controlsPanel}>
                <IconButton
                    iconDefinition={icons.SettingOutlined}
                    iconSize={headerIconButtonSize}
                    disabled={
                        props.isRightPanelDisplayed &&
                        props.rightPanelType === RightPanelType.Settings
                    }
                    color={colors.text}
                    hoverColor={colors.textSecondary}
                    disableColor={colors.accent}
                    title={'Playground settings'}
                    onPress={() => {
                        props.onShowRightPanel(RightPanelType.Settings);
                    }}
                />
                <IconButton
                    iconDefinition={icons.QuestionCircleOutlined}
                    iconSize={headerIconButtonSize}
                    disabled={
                        props.isRightPanelDisplayed && props.rightPanelType === RightPanelType.About
                    }
                    color={'#fff'}
                    hoverColor={colors.textSecondary}
                    disableColor={colors.accent}
                    title={'About BasedPyright Playground'}
                    onPress={() => {
                        props.onShowRightPanel(RightPanelType.About);
                    }}
                />
            </View>
        </View>
    );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: -1,
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingBottom: 2,
        alignSelf: 'stretch',
        alignItems: 'center',
        backgroundColor: '#000',
        height: 42,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    pyrightIcon: {
        height: 24,
        width: 24,
        marginRight: 8,
    },
    titleText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        fontVariant: ['small-caps'],
    },
    controlsPanel: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
});
