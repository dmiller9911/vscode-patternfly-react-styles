'use strict';
import { DocumentSelector, ExtensionContext, languages } from 'vscode';
import { CSSCompletionProvider } from './CompletionProvider';
import { CSSDefinitionProvider } from './DefinitionProvider';

export type TestConfigValues = false | true | 'dashes';

export function activate(context: ExtensionContext) {
  const mode: DocumentSelector = [
    { language: 'typescript', scheme: 'file' },
    { language: 'javascript', scheme: 'file' }
  ];
  context.subscriptions.push(
    languages.registerCompletionItemProvider(
      mode,
      new CSSCompletionProvider(),
      '.'
    )
  );
  context.subscriptions.push(
    languages.registerDefinitionProvider(mode, new CSSDefinitionProvider())
  );
}

export function deactivate() {}
