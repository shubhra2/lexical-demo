/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {JSX} from 'react';

import {$generateHtmlFromNodes, $generateNodesFromDOM} from '@lexical/html';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$getRoot, $insertNodes} from 'lexical';
import {useEffect} from 'react';

import {isDevPlayground} from './appSettings';
import {FlashMessageContext} from './context/FlashMessageContext';
import {SettingsContext, useSettings} from './context/SettingsContext';
import {SharedHistoryContext} from './context/SharedHistoryContext';
import {ToolbarContext} from './context/ToolbarContext';
import Editor from './Editor';
import logo from './images/logo.svg';
import PlaygroundNodes from './nodes/PlaygroundNodes';
import DocsPlugin from './plugins/DocsPlugin';
import PasteLogPlugin from './plugins/PasteLogPlugin';
import {TableContext} from './plugins/TablePlugin';
import TestRecorderPlugin from './plugins/TestRecorderPlugin';
import TypingPerfPlugin from './plugins/TypingPerfPlugin';
import Settings from './Settings';
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';

// Preload HTML Content Plugin
const SetInitialHtmlPlugin = ({initialHtml}: {initialHtml: string}) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (initialHtml) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(initialHtml, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        root.select();
        $insertNodes(nodes);
      });
    }
  }, [editor, initialHtml]);

  return null;
};

function App(): JSX.Element {
  const {
    settings: {isCollab, emptyEditor, measureTypingPerf},
  } = useSettings();

  // Example: Replace with your actual HTML content
  const yourInitialHtmlString = `<h1>Welcome to Lexical Editor</h1><p>This is a preloaded paragraph.</p>`;

  const initialConfig = {
    editorState: isCollab ? null : emptyEditor ? undefined : undefined, // Removed $prepopulatedRichText to avoid conflicts
    namespace: 'Playground',
    nodes: [...PlaygroundNodes],
    onError: (error: Error) => {
      throw error;
    },
    theme: PlaygroundEditorTheme,
  };

  const DownloadHtmlButton = () => {
    const [editor] = useLexicalComposerContext();

    const handleDownload = () => {
      editor.update(() => {
        const htmlString = $generateHtmlFromNodes(editor, null);
        const blob = new Blob([htmlString], {type: 'text/html'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'editor-content.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    };

    return <button onClick={handleDownload}>Download HTML</button>;
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <TableContext>
          <ToolbarContext>
            <header>
              <a href="https://lexical.dev" target="_blank" rel="noreferrer">
                <img src={logo} alt="Lexical Logo" />
              </a>
            </header>
            <div className="editor-shell">
              <Editor />
              <SetInitialHtmlPlugin initialHtml={yourInitialHtmlString} />
            </div>
            <Settings />
            {isDevPlayground ? <DocsPlugin /> : null}
            {isDevPlayground ? <PasteLogPlugin /> : null}
            {isDevPlayground ? <TestRecorderPlugin /> : null}
            {measureTypingPerf ? <TypingPerfPlugin /> : null}
          </ToolbarContext>
        </TableContext>
      </SharedHistoryContext>
      <DownloadHtmlButton />
    </LexicalComposer>
  );
}

export default function PlaygroundApp(): JSX.Element {
  return (
    <SettingsContext>
      <FlashMessageContext>
        <App />
      </FlashMessageContext>
    </SettingsContext>
  );
}
