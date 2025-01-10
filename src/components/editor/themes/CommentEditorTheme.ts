/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { EditorThemeClasses } from "lexical";

import "./CommentEditorTheme.css";
import lexicalTheme from "./editor-theme";

const theme: EditorThemeClasses = {
  ...lexicalTheme,
  paragraph: "CommentEditorTheme__paragraph",
};

export default theme;
