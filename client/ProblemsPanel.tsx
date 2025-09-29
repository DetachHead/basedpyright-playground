/*
 * Copyright (c) Eric Traut
 * Panel that displays a list of diagnostics.
 */

import * as icons from '@ant-design/icons-svg';
import { IconDefinition } from '@ant-design/icons-svg/lib/types';
import {
    ActivityIndicator,
    Animated,
    Easing,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Diagnostic, DiagnosticSeverity, Range } from 'vscode-languageserver-types';
import { useHover } from './HoverHook';
import { useEffect, useRef } from 'react';
import { SvgIcon } from './SvgIcon';
import { useTheme, ThemeColors } from './ThemeContext';

export interface ProblemsPanelProps {
    diagnostics: Diagnostic[];
    onSelectRange: (range: Range) => void;
    expandProblems: boolean;
    displayActivityIndicator: boolean;
}

const problemsPanelHeight = 200;
const problemsPanelHeightCollapsed = 32;

export function ProblemsPanel(props: ProblemsPanelProps) {
    const { colors } = useTheme();

    // We don't display hints in the problems panel.
    const filteredDiagnostics = props.diagnostics.filter(
        (diag) => diag.severity !== DiagnosticSeverity.Hint
    );

    // Animate the appearance of the problems panel.
    const heightAnimation = useRef(
        new Animated.Value(
            props.expandProblems ? problemsPanelHeight : problemsPanelHeightCollapsed
        )
    ).current;

    useEffect(() => {
        Animated.timing(heightAnimation, {
            toValue: props.expandProblems ? problemsPanelHeight : problemsPanelHeightCollapsed,
            duration: 250,
            useNativeDriver: false,
            easing: Easing.ease,
        }).start();
    }, [heightAnimation, props.expandProblems]);

    const styles = makeStyles(colors);

    return (
        <Animated.View style={[styles.animatedContainer, { height: heightAnimation }]}>
            <View style={styles.container}>
                <View style={styles.header}>
                    {props.expandProblems ? (
                        <View style={styles.headerContents}>
                            <Text style={styles.problemText} selectable={false}>
                                Problems
                            </Text>
                            <View style={styles.problemCountBubble}>
                                <Text style={styles.problemCountText} selectable={false}>
                                    {filteredDiagnostics.length.toString()}
                                </Text>
                            </View>
                            {props.displayActivityIndicator ? (
                                <View style={styles.activityContainer}>
                                    <Text style={styles.waitingText} selectable={false}>
                                        Waiting for worker
                                    </Text>
                                    <ActivityIndicator size={12} color={colors.accent} />
                                </View>
                            ) : undefined}
                        </View>
                    ) : undefined}
                </View>
                <ScrollView>
                    {filteredDiagnostics.length > 0 ? (
                        filteredDiagnostics.map((diag, index) => {
                            return (
                                <ProblemItem
                                    key={index}
                                    diagnostic={diag}
                                    onSelectRange={props.onSelectRange}
                                />
                            );
                        })
                    ) : (
                        <NoProblemsItem />
                    )}
                </ScrollView>
            </View>
        </Animated.View>
    );
}

function ProblemItem(props: { diagnostic: Diagnostic; onSelectRange: (range: Range) => void }) {
    const [hoverRef, isHovered] = useHover();
    const { colors } = useTheme();
    const styles = makeStyles(colors, isHovered);

    return (
        <Pressable
            ref={hoverRef}
            style={[
                styles.diagnosticContainer,
                isHovered ? styles.problemContainerHover : undefined,
            ]}
            onPress={() => {
                props.onSelectRange(props.diagnostic.range);
            }}
        >
            <View style={styles.diagnosticIconContainer}>
                <ProblemIcon severity={props.diagnostic.severity} />
            </View>
            <div title={props.diagnostic.message}>
                <View style={styles.diagnosticTextContainer}>
                    <Text style={styles.diagnosticText}>
                        <Text>{props.diagnostic.message}</Text>
                        {props.diagnostic.code ? (
                            <Text
                                style={styles.diagnosticSourceText}
                            >{`  (${props.diagnostic.code})`}</Text>
                        ) : undefined}
                    </Text>
                </View>
            </div>
        </Pressable>
    );
}

function NoProblemsItem() {
    const { colors } = useTheme();
    const styles = makeStyles(colors);

    return (
        <View style={styles.diagnosticContainer}>
            <View style={styles.diagnosticTextContainer}>
                <Text style={styles.diagnosticText} selectable={false}>
                    No problems have been detected.
                </Text>
            </View>
        </View>
    );
}

function ProblemIcon(props: { severity: DiagnosticSeverity }) {
    let iconDefinition: IconDefinition;
    let iconColor: string;

    if (props.severity === DiagnosticSeverity.Warning) {
        iconDefinition = icons.WarningOutlined;
        iconColor = '#b89500';
    } else if (props.severity === DiagnosticSeverity.Information) {
        iconDefinition = icons.InfoCircleOutlined;
        iconColor = 'blue';
    } else {
        iconDefinition = icons.CloseCircleOutlined;
        iconColor = '#e51400';
    }

    return <SvgIcon iconDefinition={iconDefinition} iconSize={14} color={iconColor} />;
}

const makeStyles = (colors: ThemeColors, isHovered = false) => StyleSheet.create({
    animatedContainer: {
        position: 'relative',
        alignSelf: 'stretch',
    },
    container: {
        flexDirection: 'column',
        height: problemsPanelHeight,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        borderStyle: 'solid',
        alignSelf: 'stretch',
        backgroundColor: colors.background,
    },
    header: {
        height: 32,
        paddingHorizontal: 8,
        backgroundColor: '#000',
        flexDirection: 'row',
        alignSelf: 'stretch',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerContents: {
        flex: 1,
        flexDirection: 'row',
        alignSelf: 'stretch',
        alignItems: 'center',
    },
    problemText: {
        marginBottom: 2,
        fontSize: 13,
        color: '#fff',
    },
    problemCountText: {
        fontSize: 9,
    },
    problemCountBubble: {
        marginLeft: 6,
        paddingHorizontal: 5,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityContainer: {
        flex: 1,
        flexDirection: 'row',
        marginRight: 4,
        justifyContent: 'flex-end',
    },
    waitingText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginRight: 8,
    },
    diagnosticContainer: {
        padding: 4,
        flexDirection: 'row',
        backgroundColor: isHovered ? colors.surface : 'transparent',
    },
    problemContainerHover: {
        backgroundColor: colors.surface,
    },
    diagnosticIconContainer: {
        marginTop: 1,
        marginRight: 8,
    },
    diagnosticTextContainer: {},
    diagnosticText: {
        fontSize: 13,
        lineHeight: 16,
        color: colors.text,
    },
    diagnosticSourceText: {
        color: colors.textSecondary,
    },
});
