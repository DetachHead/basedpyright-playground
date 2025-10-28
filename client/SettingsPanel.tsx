/*
 * Copyright (c) Eric Traut
 * A panel that displays settings for the app.
 */

import * as icons from '@ant-design/icons-svg';
import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CheckmarkMenu, CheckmarkMenuItem } from './CheckmarkMenu';
import IconButton from './IconButton';
import { getLocaleDisplayName, supportedLocales } from './Locales';
import { Menu, MenuRef } from './Menu';
import { TypeCheckingMode, PlaygroundSettings } from './PlaygroundSettings';
import PushButton from './PushButton';
import {
    PyrightConfigSetting,
    configSettings,
    configSettingsAlphabetized,
} from './PyrightConfigSettings';
import { SettingsCheckbox } from './SettingsCheckBox';
import { useTheme, ThemeColors } from './ThemeContext';

interface ConfigOptionWithValue {
    name: string;
    value: boolean;
}

export interface SettingsPanelProps {
    settings: PlaygroundSettings;
    latestPyrightVersion?: string;
    supportedPyrightVersions?: string[];
    onUpdateSettings: (settings: PlaygroundSettings) => void;
}

export function SettingsPanel(props: SettingsPanelProps) {
    const { colors } = useTheme();
    const typeCheckingModeMenuRef = useRef<MenuRef>(null);
    const configOptionsMenuRef = useRef<MenuRef>(null);
    const pyrightVersionMenuRef = useRef<MenuRef>(null);
    const pythonVersionMenuRef = useRef<MenuRef>(null);
    const pythonPlatformMenuRef = useRef<MenuRef>(null);
    const localeMenuRef = useRef<MenuRef>(null);
    const configOverrides = getNonDefaultConfigOptions(props.settings);
    const styles = makeStyles(colors);

    return (
        <View style={styles.container}>
            <SettingsHeader headerText={'Type Checking Mode'} />
            <View style={styles.selectionContainer}>
                <Text style={styles.selectedOptionText} selectable={false}>
                    {!props.settings.typeCheckingMode || props.settings.typeCheckingMode === 'all'
                        ? 'Default (all)'
                        : props.settings.typeCheckingMode}
                </Text>
                <MenuButton
                    onPress={() => {
                        typeCheckingModeMenuRef.current?.open();
                    }}
                />
                <Menu name={'typeCheckingMode'} ref={typeCheckingModeMenuRef}>
                    <CheckmarkMenu
                        items={['all', 'strict', 'standard'].map((preset) => ({
                            checked: preset === props.settings.typeCheckingMode,
                            label: preset,
                        }))}
                        onSelect={(item) => {
                            props.onUpdateSettings({
                                ...props.settings,
                                typeCheckingMode: item.label as TypeCheckingMode,
                            });
                        }}
                        includeSearchBox={true}
                        fixedSize={{ width: 300, height: 400 }}
                        onDismiss={() => {
                            typeCheckingModeMenuRef.current?.close();
                        }}
                    />
                </Menu>
            </View>

            <SettingsDivider />
            <SettingsHeader headerText={'Configuration Options'} />
            <View style={styles.selectionContainer}>
                <Text style={styles.selectedOptionText} selectable={false}>
                    {configOverrides.length === 0 ? 'Default' : 'Custom'}
                </Text>
                <MenuButton
                    onPress={() => {
                        configOptionsMenuRef.current?.open();
                    }}
                />
                <Menu name={'configOptions'} ref={configOptionsMenuRef}>
                    <CheckmarkMenu
                        items={configSettingsAlphabetized.map((item) => {
                            return getConfigOptionMenuItem(props.settings, item);
                        })}
                        onSelect={(item) => {
                            props.onUpdateSettings(toggleConfigOption(props.settings, item.label));
                        }}
                        includeSearchBox={true}
                        fixedSize={{ width: 300, height: 400 }}
                        onDismiss={() => {
                            configOptionsMenuRef.current?.close();
                        }}
                    />
                </Menu>
            </View>
            <View style={styles.overridesContainer}>
                {configOverrides.map((config) => {
                    return (
                        <ConfigOverride
                            key={config.name}
                            config={config}
                            onRemove={() => {
                                const configOverrides = { ...props.settings.configOverrides };
                                delete configOverrides[config.name];

                                props.onUpdateSettings({
                                    ...props.settings,
                                    configOverrides,
                                });
                            }}
                        />
                    );
                })}
            </View>

            <SettingsDivider />
            <SettingsHeader headerText={'Basedpyright Version'} />
            <View style={styles.selectionContainer}>
                <Text style={styles.selectedOptionText} selectable={false}>
                    {props.settings.pyrightVersion ||
                        (props.latestPyrightVersion
                            ? `Latest (${props.latestPyrightVersion})`
                            : 'Latest')}
                </Text>
                <MenuButton
                    onPress={() => {
                        pyrightVersionMenuRef.current?.open();
                    }}
                />
                <Menu name={'pyrightVersion'} ref={pyrightVersionMenuRef}>
                    <CheckmarkMenu
                        items={['Latest', ...(props.supportedPyrightVersions ?? [])].map((item) => {
                            return {
                                label: item,
                                checked: item === (props.settings.pyrightVersion ?? 'Latest'),
                            };
                        })}
                        onSelect={(item, index) => {
                            props.onUpdateSettings({
                                ...props.settings,
                                pyrightVersion: index > 0 ? item.label : undefined,
                            });
                        }}
                    />
                </Menu>
            </View>

            <SettingsDivider />
            <SettingsHeader headerText={'Python Version'} />
            <View style={styles.selectionContainer}>
                <Text style={styles.selectedOptionText} selectable={false}>
                    {props.settings.pythonVersion || 'Default (3.14)'}
                </Text>
                <MenuButton
                    onPress={() => {
                        pythonVersionMenuRef.current?.open();
                    }}
                />
                <Menu name={'pythonVersion'} ref={pythonVersionMenuRef}>
                    <CheckmarkMenu
                        items={[
                            'Default',
                            '3.14',
                            '3.13',
                            '3.12',
                            '3.11',
                            '3.10',
                            '3.9',
                            '3.8',
                            '3.7',
                            '3.6',
                        ].map((item) => {
                            return {
                                label: item,
                                checked: item === (props.settings.pythonVersion ?? 'Default'),
                            };
                        })}
                        onSelect={(item, index) => {
                            props.onUpdateSettings({
                                ...props.settings,
                                pythonVersion: index > 0 ? item.label : undefined,
                            });
                        }}
                    />
                </Menu>
            </View>

            <SettingsDivider />
            <SettingsHeader headerText={'Python Platform'} />
            <View style={styles.selectionContainer}>
                <Text style={styles.selectedOptionText} selectable={false}>
                    {props.settings.pythonPlatform || 'Default (All)'}
                </Text>
                <MenuButton
                    onPress={() => {
                        pythonPlatformMenuRef.current?.open();
                    }}
                />
                <Menu name={'pythonPlatform'} ref={pythonPlatformMenuRef}>
                    <CheckmarkMenu
                        items={['All', 'Linux', 'Darwin', 'Windows'].map((item) => {
                            return {
                                label: item,
                                checked: item === (props.settings.pythonPlatform ?? 'All'),
                            };
                        })}
                        onSelect={(item, index) => {
                            props.onUpdateSettings({
                                ...props.settings,
                                pythonPlatform: index > 0 ? item.label : undefined,
                            });
                        }}
                    />
                </Menu>
            </View>

            {/* TODO: add back language support, currently doesn't work on the browser version of basedpyright */}
            {/* <SettingsDivider />
            <SettingsHeader headerText={'Language'} />
            <View style={styles.selectionContainer}>
                <Text style={styles.selectedOptionText} selectable={false}>
                    {getLocaleDisplayName(props.settings.locale) || 'Browser Default'}
                </Text>
                <MenuButton
                    onPress={() => {
                        localeMenuRef.current?.open();
                    }}
                />
                <Menu name={'locale'} ref={localeMenuRef}>
                    <CheckmarkMenu
                        items={supportedLocales.map((locale) => {
                            return {
                                label: locale.displayName,
                                checked: locale.code === (props.settings.locale ?? ''),
                            };
                        })}
                        onSelect={(item, index) => {
                            props.onUpdateSettings({
                                ...props.settings,
                                locale: index > 0 ? supportedLocales[index].code : undefined,
                            });
                        }}
                    />
                </Menu>
            </View> */}

            <SettingsDivider />
            <View style={styles.resetButtonContainer}>
                <PushButton
                    label={'Restore Defaults'}
                    title={'Reset all settings to their default values'}
                    disabled={areSettingsDefault(props.settings)}
                    onPress={() => {
                        props.onUpdateSettings({
                            configOverrides: {},
                            typeCheckingMode: 'all',
                        });
                    }}
                />
            </View>
        </View>
    );
}

function MenuButton(props: { onPress: () => void }) {
    const { colors } = useTheme();

    return (
        <IconButton
            iconDefinition={icons.DownCircleOutlined}
            iconSize={18}
            color={colors.accent}
            hoverColor={colors.text}
            onPress={props.onPress}
        />
    );
}

function SettingsHeader(props: { headerText: string }) {
    const { colors } = useTheme();
    const styles = makeStyles(colors);

    return (
        <View style={styles.headerTextBox}>
            <Text style={styles.headerText} selectable={false}>
                {props.headerText}
            </Text>
        </View>
    );
}

function SettingsDivider() {
    const { colors } = useTheme();
    const styles = makeStyles(colors);

    return <View style={styles.divider} />;
}

interface ConfigOverrideProps {
    config: ConfigOptionWithValue;
    onRemove: () => void;
}

function ConfigOverride(props: ConfigOverrideProps) {
    const { colors } = useTheme();
    const text = `${props.config.name}=${props.config.value.toString()}`;
    const styles = makeStyles(colors);

    return (
        <View style={styles.configOverrideContainer}>
            <Text style={styles.configOverrideText} selectable={false} numberOfLines={1}>
                {text}
            </Text>
            <View style={{ marginTop: -4 }}>
                <IconButton
                    iconDefinition={icons.CloseOutlined}
                    iconSize={12}
                    color={colors.textSecondary}
                    hoverColor={colors.text}
                    onPress={props.onRemove}
                />
            </View>
        </View>
    );
}

function areSettingsDefault(settings: PlaygroundSettings): boolean {
    return (
        Object.keys(settings.configOverrides).length === 0 &&
        settings.typeCheckingMode === 'all' &&
        settings.pyrightVersion === undefined &&
        settings.pythonVersion === undefined &&
        settings.pythonPlatform === undefined &&
        settings.locale === undefined
    );
}

const defaultOption = (option: PyrightConfigSetting, settings: PlaygroundSettings) =>
    ({
        all: option.isEnabeldInAll ?? true,
        strict: option.isEnabledInStrict,
        standard: option.isEnabledInStandard,
    }[settings.typeCheckingMode]);

const isEnabled = (option: PyrightConfigSetting, settings: PlaygroundSettings) =>
    settings.configOverrides[option.name] ?? defaultOption(option, settings);

const getNonDefaultConfigOptions = (settings: PlaygroundSettings): ConfigOptionWithValue[] =>
    configSettingsAlphabetized
        .filter((option) => defaultOption(option, settings) !== isEnabled(option, settings))
        .map((option) => ({ name: option.name, value: isEnabled(option, settings) }));

function getConfigOptionMenuItem(
    settings: PlaygroundSettings,
    config: PyrightConfigSetting
): CheckmarkMenuItem {
    return {
        label: config.name,
        checked: isEnabled(config, settings),
        disabled: false,
        title: config.description,
    };
}

function toggleConfigOption(settings: PlaygroundSettings, optionName: string): PlaygroundSettings {
    const configOverrides = { ...settings.configOverrides };
    const configInfo = configSettings.find((s) => s.name === optionName);
    const isEnabledByDefault = defaultOption(configInfo, settings);
    const isEnabled = configOverrides[optionName] ?? isEnabledByDefault;

    if (isEnabledByDefault === !isEnabled) {
        // If the new value matches the default value, delete it
        // to restore the default.
        delete configOverrides[optionName];
    } else {
        configOverrides[optionName] = !isEnabled;
    }

    return { ...settings, configOverrides };
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignSelf: 'stretch',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: colors.surface,
    },
    divider: {
        height: 1,
        borderTopWidth: 1,
        borderColor: colors.border,
        borderStyle: 'solid',
        marginVertical: 8,
    },
    headerTextBox: {
        marginBottom: 4,
    },
    headerText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontVariant: ['small-caps'],
    },
    resetButtonContainer: {
        alignSelf: 'center',
        marginTop: 4,
        marginHorizontal: 8,
    },
    selectionContainer: {
        height: 24,
        paddingTop: 6,
        paddingBottom: 2,
        paddingHorizontal: 16,
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius: 4,
        marginBottom: 2,
    },
    selectedOptionText: {
        fontSize: 13,
        color: colors.text,
        flex: 1,
    },
    overridesContainer: {
        flexDirection: 'column',
        marginTop: 4,
    },
    configOverrideContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: 16,
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    configOverrideText: {
        flex: -1,
        fontSize: 12,
        color: colors.text,
    },
});
