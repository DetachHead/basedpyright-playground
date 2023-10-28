/*
 * Copyright (c) Eric Traut
 * Information about the configuration settings in pyright.
 */

export interface PyrightConfigSetting {
    name: string;
    description: string;
    isEnabledInBasic: boolean;
    isEnabledInStrict: boolean;
}

export const configSettings: PyrightConfigSetting[] = [
    {
        name: 'analyzeUnannotatedFunctions',
        description: 'Analyze and report diagnostics for functions that have no annotations',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'strictParameterNoneValue',
        description: 'Allow implicit Optional when default parameter value is None',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'enableTypeIgnoreComments',
        description: 'Allow "# type: ignore" comments',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'disableBytesTypePromotions',
        description: 'Do not treat bytearray and memoryview as implicit subtypes of bytes',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'strictListInference',
        description: 'Infer strict types for list expressions',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'strictDictionaryInference',
        description: 'Infer strict types for dictionary expressions',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'strictSetInference',
        description: 'Infer strict types for set expressions',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportMissingModuleSource',
        description: 'Controls reporting of imports that cannot be resolved to source files',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'reportMissingImports',
        description: 'Controls reporting of imports that cannot be resolved',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'reportUndefinedVariable',
        description: 'Controls reporting of attempts to use an undefined variable',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'reportAssertAlwaysTrue',
        description: 'Controls reporting assert expressions that will always evaluate to true',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'reportInvalidStringEscapeSequence',
        description: 'Controls reporting of invalid escape sequences used within string literals',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'reportInvalidTypeVarUse',
        description: 'Controls reporting improper use of type variables within function signatures',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'reportMissingTypeStubs',
        description: 'Controls reporting of imports that cannot be resolved to type stub files',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'reportSelfClsParameterName',
        description: 'Controls reporting assert expressions that will always evaluate to true',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'reportUnsupportedDunderAll',
        description: 'Controls reporting of unsupported operations performed on __all__',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'reportUnusedExpression',
        description: 'Controls reporting of simple expressions whose value is not used in any way',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'reportWildcardImportFromLibrary',
        description: 'Controls reporting of wlidcard import from external library',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'reportGeneralTypeIssues',
        description: 'Controls reporting of general type issues',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'reportOptionalSubscript',
        description:
            'Controls reporting of attempts to subscript (index) a variable with Optional type',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'reportOptionalMemberAccess',
        description:
            'Controls reporting of attempts to access a member of a variable with Optional type',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'reportOptionalCall',
        description: 'Controls reporting of attempts to call a variable with Optional type',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'reportOptionalIterable',
        description: 'Controls reporting of attempts to use an Optional type as an iterable value',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'reportOptionalContextManager',
        description:
            'Controls reporting of attempts to use an Optional type as a parameter to a with statement',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'reportOptionalOperand',
        description:
            'Controls reporting of attempts to use an Optional type as an operand for a binary or unary operator',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'reportTypedDictNotRequiredAccess',
        description:
            'Controls reporting of attempts to access a non-required key in a TypedDict without a check for its presence',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'reportPrivateImportUsage',
        description:
            'Controls reporting of improper usage of symbol imported from a "py.typed" module that is not re-exported from that module',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'reportUnboundVariable',
        description:
            'Controls reporting of attempts to use an unbound or possibly unbound variable',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'reportUnusedCoroutine',
        description:
            'Controls reporting of call expressions that returns Coroutine whose results are not consumed',
        isEnabledInBasic: true,
        isEnabledInStrict: true,
    },
    {
        name: 'reportConstantRedefinition',
        description: 'Controls reporting of attempts to redefine variables that are in all-caps',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportDeprecated',
        description: 'Controls reporting of use of deprecated class or function',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportDuplicateImport',
        description: 'Controls reporting of symbols or modules that are imported more than once',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportFunctionMemberAccess',
        description: 'Controls reporting of member accesses on function objects',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportIncompatibleMethodOverride',
        description:
            'Controls reporting of method overrides in subclasses that redefine the method in an incompatible way',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportIncompatibleVariableOverride',
        description:
            'Controls reporting of overrides in subclasses that redefine a variable in an incompatible way',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportIncompleteStub',
        description:
            'Controls reporting of incomplete type stubs that declare a module-level __getattr__ function',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportInconsistentConstructor',
        description:
            'Controls reporting of __init__ and __new__ methods whose signatures are inconsistent',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    // Stubs are not modeled in the playground, so this setting is not relevant.
    // {
    //     name: 'reportInvalidStubStatement',
    //     description: 'Controls reporting of type stub statements that do not conform to PEP 484',
    //     isEnabledInBasic: false,
    //     isEnabledInStrict: true,
    // },
    {
        name: 'reportMatchNotExhaustive',
        description:
            'Controls reporting of match statements that do not exhaustively match all possible values',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportMissingParameterType',
        description: 'Controls reporting input parameters that are missing a type annotation',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportMissingTypeArgument',
        description: 'Controls reporting generic class reference with missing type arguments',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportOverlappingOverload',
        description:
            'Controls reporting of function overloads that overlap in signature and obscure each other or do not agree on return type',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportPrivateUsage',
        description:
            'Controls reporting of private variables and functions used outside of the owning class or module and usage of protected members outside of subclasses',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportTypeCommentUsage',
        description: 'Controls reporting of deprecated type comment usage',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportUnknownArgumentType',
        description: 'Controls reporting argument expressions whose types are unknown',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportUnknownLambdaType',
        description:
            'Controls reporting input and return parameters for lambdas whose types are unknown',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportUnknownMemberType',
        description: 'Controls reporting class and instance variables whose types are unknown',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportUnknownParameterType',
        description: 'Controls reporting input and return parameters whose types are unknown',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportUnknownVariableType',
        description: 'Controls reporting local variables whose types are unknown',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportUnnecessaryCast',
        description: 'Controls reporting calls to "cast" that are unnecessary',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportUnnecessaryComparison',
        description: 'Controls reporting the use of "==" or "!=" comparisons that are unnecessary',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportUnnecessaryContains',
        description: 'Controls reporting the use of "in" operations that are unnecessary',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportUnnecessaryIsInstance',
        description:
            'Controls reporting calls to "isinstance" or "issubclass" where the result is statically determined to be always true',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportUnusedClass',
        description: 'Controls reporting of private classes that are not accessed',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportUnusedImport',
        description:
            'Controls reporting of imported symbols that are not referenced within the source file',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportUnusedFunction',
        description: 'Controls reporting of private functions or methods that are not accessed',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportUnusedVariable',
        description: 'Controls reporting of private functions or methods that are not accessed',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportUntypedBaseClass',
        description:
            'Controls reporting of a base class of an unknown type, which obscures most type checking for the class',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportUntypedClassDecorator',
        description:
            'Controls reporting of class decorators without type annotations, which obscure class types',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportUntypedFunctionDecorator',
        description:
            'Controls reporting of function decorators without type annotations, which obscure function types',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'reportUntypedNamedTuple',
        description:
            'Controls reporting of a named tuple definition that does not contain type information',
        isEnabledInBasic: false,
        isEnabledInStrict: true,
    },
    {
        name: 'deprecateTypingAliases',
        description: 'Treat typing-specific aliases to standard types as deprecated',
        isEnabledInBasic: false,
        isEnabledInStrict: false,
    },
    {
        name: 'enableExperimentalFeatures',
        description:
            'Enable the use of experimental features that are not part of the Python typing spec',
        isEnabledInBasic: false,
        isEnabledInStrict: false,
    },
    {
        name: 'reportCallInDefaultInitializer',
        description:
            'Controls reporting usage of function calls within a default value initializer expression',
        isEnabledInBasic: false,
        isEnabledInStrict: false,
    },
    {
        name: 'reportImplicitOverride',
        description:
            'Controls reporting overridden methods that are missing an "@override" decorator',
        isEnabledInBasic: false,
        isEnabledInStrict: false,
    },
    {
        name: 'reportImplicitStringConcatenation',
        description: 'Controls reporting usage of implicit concatenation of string literals',
        isEnabledInBasic: false,
        isEnabledInStrict: false,
    },
    {
        name: 'reportMissingSuperCall',
        description:
            'Controls reporting of missing call to parent class for inherited "__init__" methods',
        isEnabledInBasic: false,
        isEnabledInStrict: false,
    },
    {
        name: 'reportPropertyTypeMismatch',
        description: 'Controls reporting of property getter/setter type mismatches',
        isEnabledInBasic: false,
        isEnabledInStrict: false,
    },
    {
        name: 'reportShadowedImports',
        description: 'Controls reporting of shadowed imports of stdlib modules',
        isEnabledInBasic: false,
        isEnabledInStrict: false,
    },
    {
        name: 'reportUninitializedInstanceVariable',
        description:
            'Controls reporting of instance variables that are not initialized in the constructor',
        isEnabledInBasic: false,
        isEnabledInStrict: false,
    },
    {
        name: 'reportUnnecessaryTypeIgnoreComment',
        description: 'Controls reporting of "# type: ignore" comments that have no effect',
        isEnabledInBasic: false,
        isEnabledInStrict: false,
    },
    {
        name: 'reportUnusedCallResult',
        description: 'Controls reporting of call expressions whose results are not consumed',
        isEnabledInBasic: false,
        isEnabledInStrict: false,
    },
];

export const configSettingsAlphabetized = configSettings.sort((a, b) => {
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
});

export const configSettingsMap = new Map<string, PyrightConfigSetting>();
configSettings.forEach((setting) => {
    configSettingsMap.set(setting.name, setting);
});