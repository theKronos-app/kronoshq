import { $createLinkNode } from "@lexical/link";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { createLazyFileRoute } from "@tanstack/react-router";
import EditorComponent from "@/components/editor/editor-component";
import { FlashMessageContext } from "@/components/editor/context/FlashMessageContext";
import { ToolbarContext } from "@/components/editor/context/ToolbarContext";
import { SharedHistoryContext } from "@/components/editor/context/SharedHistoryContext";
import { TableContext } from "@/components/editor/plugins/TablePlugin";
import {
  SettingsContext,
  useSettings,
} from "@/components/editor/context/SettingsContext";
import PlaygroundNodes from "@/components/editor/nodes/PlaygroundNodes";
import Settings from "@/components/editor/Settings";

function $prepopulatedRichText() {
  const root = $getRoot();
  if (root.getFirstChild() === null) {
    const heading = $createHeadingNode("h1");
    heading.append($createTextNode("Welcome to Kronos"));
    root.append(heading);
    const paragraph = $createParagraphNode();
    paragraph.append($createTextNode("Start writing your thoughts here..."));
    root.append(paragraph);
  }
}

export const Route = createLazyFileRoute("/journal")({
  component: Journal,
});

function Journal() {
  const {
    settings: { isCollab, emptyEditor, measureTypingPerf },
  } = useSettings();

  const initialConfig = {
    editorState: $prepopulatedRichText,
    namespace: "KronosJournal",
    nodes: [...PlaygroundNodes],
    onError: (error: Error) => {
      console.error(error);
    },
  };

  // .editor-shell {
  //   margin: 20px auto;
  //   border-radius: 2px;
  //   max-width: 1100px;
  //   color: #000;
  //   position: relative;
  //   line-height: 1.7;
  //   font-weight: 400;
  // }
  return (
    <div className="p-2">
      <FlashMessageContext>
        <SettingsContext>
          <LexicalComposer initialConfig={initialConfig}>
            <SharedHistoryContext>
              <TableContext>
                <ToolbarContext>
                  <div className="my-5 rounded max-w-[1100px] relative font-normal">
                    <EditorComponent />
                  </div>
                  <Settings />
                  {/* {isDevPlayground ? <DocsPlugin /> : null} */}
                  {/* {isDevPlayground ? <PasteLogPlugin /> : null} */}
                  {/* {isDevPlayground ? <TestRecorderPlugin /> : null} */}
                  {/**/}
                  {/* {measureTypingPerf ? <TypingPerfPlugin /> : null} */}
                </ToolbarContext>
              </TableContext>
            </SharedHistoryContext>
          </LexicalComposer>
        </SettingsContext>
      </FlashMessageContext>
    </div>
  );
}
