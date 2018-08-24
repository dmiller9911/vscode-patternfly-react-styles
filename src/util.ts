import { Position, TextDocument } from 'vscode';
import * as fs from 'fs';
import * as resolveFrom from 'resolve-from';

export function getCurrentLine(
  document: TextDocument,
  position: Position
): string {
  return document.getText(document.lineAt(position).range);
}

export function genImportRegExp(key: string): RegExp {
  const file = '(.+\\.\\S{1,2}ss)';
  const fromOrRequire = '(?:from\\s+|=\\s+require(?:<any>)?\\()';
  const requireEndOptional = '\\)?';
  const pattern = `${key}\\s+${fromOrRequire}["']${file}["']${requireEndOptional}`;
  return new RegExp(pattern);
}

export function findImportPath(
  text: string,
  key: string,
  parentPath: string
): string {
  const re = genImportRegExp(key);
  const results = re.exec(text);
  if (!!results && results.length > 0) {
    return resolveFrom(parentPath, results[1]);
  } else {
    return '';
  }
}

export function getCssFile(filePath: string) {
  return fs.readFileSync(filePath, { encoding: 'utf8' });
}
