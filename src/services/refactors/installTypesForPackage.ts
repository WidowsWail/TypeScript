/* @internal */
namespace ts.refactor.installTypesForPackage {
    const actionName = "install";

    const installTypesForPackage: Refactor = {
        name: "Install missing types package",
        description: "Install missing types package", // This doesn't seem to be used anywhere...
        getEditsForAction,
        getAvailableActions
    };

    registerRefactor(installTypesForPackage);

    //TODO: test!
    function getAvailableActions(context: RefactorContext): ApplicableRefactorInfo[] | undefined {
        if (context.program.getCompilerOptions().noImplicitAny) {
            // Then it will be available via `fixCannotFindModule`.
        }

        const action = doit(context);
        return action && [
            {
                name: installTypesForPackage.name,
                description: installTypesForPackage.description,
                actions: [
                    {
                        description: action.description,
                        name: actionName,
                    }
                ]
            }
        ];
    }

    function getEditsForAction(context: RefactorContext, _actionName: string): RefactorEditInfo | undefined {
        Debug.assertEqual(actionName, _actionName);
        const action = doit(context);
        return action && {
            edits: [],
            renameFilename: undefined,
            renameLocation: undefined,
            commands: action.commands,
        }
    }

    function doit(context: RefactorContext): { description: CodeAction["description"], commands?: CodeAction["commands"] } | undefined { //name
        const { file, startPosition } = context;
        const node = getTokenAtPosition(file, startPosition, /*includeJsDocComment*/ false);
        if (!isStringLiteral(node)) {
            return undefined;
        }

        if (node.parent.kind !== SyntaxKind.ImportDeclaration) {
            return undefined;
        }

        if (getResolvedModule(file, node.text) !== undefined) {
            return undefined;
        }

        return ts.codefix.getCodeActionForInstallPackageTypes(context.host, node.text);
    }
}