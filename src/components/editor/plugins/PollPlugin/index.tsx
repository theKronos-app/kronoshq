import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement } from "@lexical/utils";
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
  LexicalEditor,
} from "lexical";
import { useEffect, useState } from "react";
import * as React from "react";

import {
  $createPollNode,
  createPollOption,
  PollNode,
} from "../../nodes/PollNode";
import TextInput from "../../components/TextInput";
import { DialogActions } from "../../components/Dialog";
import { Button } from "@/components/ui/button";

export const INSERT_POLL_COMMAND: LexicalCommand<string> = createCommand(
  "INSERT_POLL_COMMAND",
);

export function InsertPollDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  const [question, setQuestion] = useState("");

  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_POLL_COMMAND, question);
    onClose();
  };

  return (
    <>
      <TextInput label="Question" onChange={setQuestion} value={question} />
      <DialogActions>
        <Button disabled={question.trim() === ""} onClick={onClick}>
          Confirm
        </Button>
      </DialogActions>
    </>
  );
}

export default function PollPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([PollNode])) {
      throw new Error("PollPlugin: PollNode not registered on editor");
    }

    return editor.registerCommand<string>(
      INSERT_POLL_COMMAND,
      (payload) => {
        const pollNode = $createPollNode(payload, [
          createPollOption(),
          createPollOption(),
        ]);
        $insertNodes([pollNode]);
        if ($isRootOrShadowRoot(pollNode.getParentOrThrow())) {
          $wrapNodeInElement(pollNode, $createParagraphNode).selectEnd();
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);
  return null;
}