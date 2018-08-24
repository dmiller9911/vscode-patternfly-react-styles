import {
  CompletionItemProvider,
  TextDocument,
  Position,
  CompletionItem,
  CompletionItemKind,
  CompletionList
} from 'vscode';
import * as path from 'path';
import { findImportPath, getCurrentLine, getCssFile } from './util';
import {
  StyleSheet,
  isValidStyleDeclaration,
  StyleSheetValueStatic
} from '@patternfly/react-styles';

// check if current character or last character is .
function isTrigger(line: string, position: Position): boolean {
  const i = position.character - 1;
  return line[i] === '.' || (i > 1 && line[i - 1] === '.');
}

function getWords(line: string, position: Position): string {
  const text = line.slice(0, position.character);
  const index = text.search(/[a-zA-Z0-9\._]*$/);
  if (index === -1) {
    return '';
  }

  return text.slice(index);
}

export class CSSCompletionProvider implements CompletionItemProvider {
  provideCompletionItems(
    document: TextDocument,
    position: Position
  ): Thenable<CompletionItem[] | CompletionList> {
    const currentLine = getCurrentLine(document, position);
    const currentDir = path.dirname(document.uri.fsPath);

    if (!isTrigger(currentLine, position)) {
      return Promise.resolve([]);
    }

    const words = getWords(currentLine, position);
    if (words === '' || words.indexOf('.') === -1) {
      return Promise.resolve([]);
    }

    const splitWords = words.split('.');

    const importPath = findImportPath(
      document.getText(),
      splitWords[0],
      currentDir
    );
    if (importPath === '') {
      return Promise.resolve([]);
    }
    const cssContent = getCssFile(importPath);
    const styleObject = StyleSheet.parse(cssContent);

    if (splitWords.length > 2) {
      const [, nestedProperty, keyWord] = splitWords;
      if (nestedProperty === 'vars' || nestedProperty === 'modifiers') {
        return Promise.resolve(
          getCompletionItemsForObject(styleObject[nestedProperty], keyWord)
        );
      }
      return Promise.resolve([]);
    } else {
      const { modifiers: _m, vars: _v, ...allClasses } = styleObject;
      const keyWord = splitWords[1];
      const list = new CompletionList([
        ...getCompletionItemsForObject(allClasses, keyWord),
        createCompletionItem('modifiers')
      ]);

      return Promise.resolve(list);
    }
  }
}

function getCompletionItemsForObject(
  obj: StyleSheetValueStatic | StyleSheetValueStatic['modifiers'],
  keyWord: string
) {
  const filteredKeys = filterKeys(obj, keyWord);
  return filteredKeys.map(key => {
    const value = obj[key];
    return createCompletionItem(
      key,
      isValidStyleDeclaration(value) ? value.__className : value
    );
  });
}

function filterKeys<T extends object>(obj: T, keyWord: string) {
  return Object.keys(obj).filter(key => key.includes(keyWord));
}

function createCompletionItem(label: string, detail?: string) {
  const item = new CompletionItem(label, CompletionItemKind.Field);
  if (detail) {
    item.detail = `(property) ${label}: "${detail}"`;
  }
  return item;
}

export default CSSCompletionProvider;
