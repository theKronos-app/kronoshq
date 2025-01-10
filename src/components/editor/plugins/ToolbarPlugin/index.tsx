import {
  $isCodeNode,
  CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  CODE_LANGUAGE_MAP,
  getLanguageFriendlyName,
} from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $isListNode, ListNode } from "@lexical/list";
import { INSERT_EMBED_COMMAND } from "@lexical/react/LexicalAutoEmbedPlugin";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { $isHeadingNode } from "@lexical/rich-text";
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText,
} from "@lexical/selection";
import { $isTableNode, $isTableSelection } from "@lexical/table";
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  $isEditorIsNestedEditor,
  IS_APPLE,
  mergeRegister,
} from "@lexical/utils";
import {
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  type ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  type LexicalEditor,
  type NodeKey,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { type Dispatch, useCallback, useEffect, useState } from "react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  Underline, 
  Code, 
  Link, 
  Undo2, 
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Indent,
  Outdent,
  Type,
  ChevronDown,
  Strikethrough,
  Subscript,
  Superscript,
  CaseSensitive,
  PaintBucket
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  blockTypeToBlockName,
  useToolbarState,
} from "../../context/ToolbarContext";
import useModal from "../../hooks/useModal";
import catTypingGif from "../../images/cat-typing.gif";
import { $createStickyNode } from "../../nodes/StickyNode";
import { getSelectedNode } from "../../utils/getSelectedNode";
import { sanitizeUrl } from "../../utils/url";
import { EmbedConfigs } from "../AutoEmbedPlugin";
import { INSERT_COLLAPSIBLE_COMMAND } from "../CollapsiblePlugin";
import { InsertEquationDialog } from "../EquationsPlugin";
import { INSERT_EXCALIDRAW_COMMAND } from "../ExcalidrawPlugin";
import {
  INSERT_IMAGE_COMMAND,
  InsertImageDialog,
  type InsertImagePayload,
} from "../ImagesPlugin";
import { InsertInlineImageDialog } from "../InlineImagePlugin";
import InsertLayoutDialog from "../LayoutPlugin/InsertLayoutDialog";
import { INSERT_PAGE_BREAK } from "../PageBreakPlugin";
import { InsertPollDialog } from "../PollPlugin";
import { SHORTCUTS } from "../ShortcutsPlugin/shortcuts";
import { InsertTableDialog } from "../TablePlugin";
import FontSize from "./fontSize";
import {
  clearFormatting,
  formatBulletList,
  formatCheckList,
  formatCode,
  formatHeading,
  formatNumberedList,
  formatParagraph,
  formatQuote,
} from "./utils";
import { LinkDialog } from "./link-dialog";

const rootTypeToRootName = {
  root: "Root",
  table: "Table",
};

function getCodeLanguageOptions(): [string, string][] {
  const options: [string, string][] = [];

  for (const [lang, friendlyName] of Object.entries(
    CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  )) {
    options.push([lang, friendlyName]);
  }

  return options;
}

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ["Arial", "Arial"],
  ["Courier New", "Courier New"],
  ["Georgia", "Georgia"],
  ["Times New Roman", "Times New Roman"],
  ["Trebuchet MS", "Trebuchet MS"],
  ["Verdana", "Verdana"],
];

const FONT_SIZE_OPTIONS: [string, string][] = [
  ["10px", "10px"],
  ["11px", "11px"],
  ["12px", "12px"],
  ["13px", "13px"],
  ["14px", "14px"],
  ["15px", "15px"],
  ["16px", "16px"],
  ["17px", "17px"],
  ["18px", "18px"],
  ["19px", "19px"],
  ["20px", "20px"],
];

const ELEMENT_FORMAT_OPTIONS: {
  [key in Exclude<ElementFormatType, "">]: {
    icon: string;
    iconRTL: string;
    name: string;
  };
} = {
  center: {
    icon: "center-align",
    iconRTL: "center-align",
    name: "Center Align",
  },
  end: {
    icon: "right-align",
    iconRTL: "left-align",
    name: "End Align",
  },
  justify: {
    icon: "justify-align",
    iconRTL: "justify-align",
    name: "Justify Align",
  },
  left: {
    icon: "left-align",
    iconRTL: "left-align",
    name: "Left Align",
  },
  right: {
    icon: "right-align",
    iconRTL: "right-align",
    name: "Right Align",
  },
  start: {
    icon: "left-align",
    iconRTL: "right-align",
    name: "Start Align",
  },
};

function dropDownActiveClass(active: boolean) {
  if (active) {
    return "active dropdown-item-active";
  } else {
    return "";
  }
}

function Divider(): JSX.Element {
  return <div className="w-px bg-gray-200 mx-1" />;
}

function BlockFormatDropDown({
  editor,
  blockType,
  rootType,
  disabled = false,
}: {
  blockType: keyof typeof blockTypeToBlockName;
  rootType: keyof typeof rootTypeToRootName;
  editor: LexicalEditor;
  disabled?: boolean;
}): JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        disabled={disabled}
      >
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex items-center gap-1 h-8",
            disabled && "opacity-50"
          )}
        >
          {blockTypeToBlockName[blockType]}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => formatParagraph(editor)}
            className={cn(blockType === "paragraph" && "bg-accent")}
          >
            <Type className="h-4 w-4" />
            <span>Normal</span>
            <DropdownMenuShortcut>{SHORTCUTS.NORMAL}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => formatHeading(editor, blockType, "h1")}
            className={cn(blockType === "h1" && "bg-accent")}
          >
            <Heading1 className="h-4 w-4" />
            <span>Heading 1</span>
            <DropdownMenuShortcut>{SHORTCUTS.HEADING1}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => formatHeading(editor, blockType, "h2")}
            className={cn(blockType === "h2" && "bg-accent")}
          >
            <Heading2 className="h-4 w-4" />
            <span>Heading 2</span>
            <DropdownMenuShortcut>{SHORTCUTS.HEADING2}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => formatHeading(editor, blockType, "h3")}
            className={cn(blockType === "h3" && "bg-accent")}
          >
            <Heading3 className="h-4 w-4" />
            <span>Heading 3</span>
            <DropdownMenuShortcut>{SHORTCUTS.HEADING3}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => formatBulletList(editor, blockType)}
            className={cn(blockType === "bullet" && "bg-accent")}
          >
            <List className="h-4 w-4" />
            <span>Bullet List</span>
            <DropdownMenuShortcut>{SHORTCUTS.BULLET_LIST}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => formatNumberedList(editor, blockType)}
            className={cn(blockType === "number" && "bg-accent")}
          >
            <ListOrdered className="h-4 w-4" />
            <span>Numbered List</span>
            <DropdownMenuShortcut>{SHORTCUTS.NUMBERED_LIST}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => formatCheckList(editor, blockType)}
            className={cn(blockType === "check" && "bg-accent")}
          >
            <CheckSquare className="h-4 w-4" />
            <span>Check List</span>
            <DropdownMenuShortcut>{SHORTCUTS.CHECK_LIST}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => formatQuote(editor, blockType)}
            className={cn(blockType === "quote" && "bg-accent")}
          >
            <Quote className="h-4 w-4" />
            <span>Quote</span>
            <DropdownMenuShortcut>{SHORTCUTS.QUOTE}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => formatCode(editor, blockType)}
            className={cn(blockType === "code" && "bg-accent")}
          >
            <Code className="h-4 w-4" />
            <span>Code Block</span>
            <DropdownMenuShortcut>{SHORTCUTS.CODE_BLOCK}</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FontDropDown({
  editor,
  value,
  style,
  disabled = false,
}: {
  editor: LexicalEditor;
  value: string;
  style: string;
  disabled?: boolean;
}): JSX.Element {
  const handleClick = useCallback(
    (option: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection !== null) {
          $patchStyleText(selection, {
            [style]: option,
          });
        }
      });
    },
    [editor, style],
  );

  const buttonAriaLabel =
    style === "font-family"
      ? "Formatting options for font family"
      : "Formatting options for font size";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        disabled={disabled}
      >
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex items-center gap-1 h-8",
            disabled && "opacity-50"
          )}
        >
          {value}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          {(style === "font-family" ? FONT_FAMILY_OPTIONS : FONT_SIZE_OPTIONS).map(
            ([option, text]) => (
              <DropdownMenuItem
                key={option}
                onClick={() => handleClick(option)}
                className={cn(value === option && "bg-accent")}
              >
                <span>{text}</span>
              </DropdownMenuItem>
            ),
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ElementFormatDropdown({
  editor,
  value,
  isRTL,
  disabled = false,
}: {
  editor: LexicalEditor;
  value: ElementFormatType;
  isRTL: boolean;
  disabled: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        disabled={disabled}
      >
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex items-center gap-1 h-8",
            disabled && "opacity-50"
          )}
        >
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Left'}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
            }}
            className={cn(value === "left" && "bg-accent")}
          >
            <AlignLeft className="h-4 w-4" />
            <span>Left Align</span>
            <DropdownMenuShortcut>{SHORTCUTS.LEFT_ALIGN}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
            }}
            className={cn(value === "center" && "bg-accent")}
          >
            <AlignCenter className="h-4 w-4" />
            <span>Center Align</span>
            <DropdownMenuShortcut>{SHORTCUTS.CENTER_ALIGN}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
            }}
            className={cn(value === "right" && "bg-accent")}
          >
            <AlignRight className="h-4 w-4" />
            <span>Right Align</span>
            <DropdownMenuShortcut>{SHORTCUTS.RIGHT_ALIGN}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
            }}
            className={cn(value === "justify" && "bg-accent")}
          >
            <AlignJustify className="h-4 w-4" />
            <span>Justify Align</span>
            <DropdownMenuShortcut>{SHORTCUTS.JUSTIFY_ALIGN}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "start");
            }}
            className={cn(value === "start" && "bg-accent")}
          >
            {isRTL ? <AlignRight className="h-4 w-4" /> : <AlignLeft className="h-4 w-4" />}
            <span>Start Align</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "end");
            }}
            className={cn(value === "end" && "bg-accent")}
          >
            {isRTL ? <AlignLeft className="h-4 w-4" /> : <AlignRight className="h-4 w-4" />}
            <span>End Align</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
            }}
          >
            <Outdent className="h-4 w-4" />
            <span>Outdent</span>
            <DropdownMenuShortcut>{SHORTCUTS.OUTDENT}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
            }}
          >
            <Indent className="h-4 w-4" />
            <span>Indent</span>
            <DropdownMenuShortcut>{SHORTCUTS.INDENT}</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ToolbarPlugin({
  editor,
  activeEditor,
  setActiveEditor,
  setIsLinkEditMode,
}: {
  editor: LexicalEditor;
  activeEditor: LexicalEditor;
  setActiveEditor: Dispatch<LexicalEditor>;
  setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element {
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(
    null,
  );
  const [modal, showModal] = useModal();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const { toolbarState, updateToolbarState } = useToolbarState();

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      if (activeEditor !== editor && $isEditorIsNestedEditor(activeEditor)) {
        const rootElement = activeEditor.getRootElement();
        updateToolbarState(
          "isImageCaption",
          !!rootElement?.parentElement?.classList.contains(
            "image-caption-container",
          ),
        );
      } else {
        updateToolbarState("isImageCaption", false);
      }

      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      updateToolbarState("isRTL", $isParentElementRTL(selection));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      const isLink = $isLinkNode(parent) || $isLinkNode(node);
      updateToolbarState("isLink", isLink);

      const tableNode = $findMatchingParent(node, $isTableNode);
      if ($isTableNode(tableNode)) {
        updateToolbarState("rootType", "table");
      } else {
        updateToolbarState("rootType", "root");
      }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode,
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();

          updateToolbarState("blockType", type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            updateToolbarState(
              "blockType",
              type as keyof typeof blockTypeToBlockName,
            );
          }
          if ($isCodeNode(element)) {
            const language =
              element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
            updateToolbarState(
              "codeLanguage",
              language ? CODE_LANGUAGE_MAP[language] || language : "",
            );
            return;
          }
        }
      }
      // Handle buttons
      updateToolbarState(
        "fontColor",
        $getSelectionStyleValueForProperty(selection, "color", "#000"),
      );
      updateToolbarState(
        "bgColor",
        $getSelectionStyleValueForProperty(
          selection,
          "background-color",
          "#fff",
        ),
      );
      updateToolbarState(
        "fontFamily",
        $getSelectionStyleValueForProperty(selection, "font-family", "Arial"),
      );
      let matchingParent;
      if ($isLinkNode(parent)) {
        // If node is a link, we need to fetch the parent paragraph node to set format
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline(),
        );
      }

      // If matchingParent is a valid node, pass it's format type
      updateToolbarState(
        "elementFormat",
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
            ? node.getFormatType()
            : parent?.getFormatType() || "left",
      );
    }
    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      // Update text format
      updateToolbarState("isBold", selection.hasFormat("bold"));
      updateToolbarState("isItalic", selection.hasFormat("italic"));
      updateToolbarState("isUnderline", selection.hasFormat("underline"));
      updateToolbarState(
        "isStrikethrough",
        selection.hasFormat("strikethrough"),
      );
      updateToolbarState("isSubscript", selection.hasFormat("subscript"));
      updateToolbarState("isSuperscript", selection.hasFormat("superscript"));
      updateToolbarState("isCode", selection.hasFormat("code"));
      updateToolbarState(
        "fontSize",
        $getSelectionStyleValueForProperty(selection, "font-size", "15px"),
      );
      updateToolbarState("isLowercase", selection.hasFormat("lowercase"));
      updateToolbarState("isUppercase", selection.hasFormat("uppercase"));
      updateToolbarState("isCapitalize", selection.hasFormat("capitalize"));
    }
  }, [activeEditor, editor, updateToolbarState]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        setActiveEditor(newEditor);
        $updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, $updateToolbar, setActiveEditor]);

  useEffect(() => {
    activeEditor.getEditorState().read(() => {
      $updateToolbar();
    });
  }, [activeEditor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          updateToolbarState("canUndo", payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          updateToolbarState("canRedo", payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [$updateToolbar, activeEditor, editor, updateToolbarState]);

  const applyStyleText = useCallback(
    (styles: Record<string, string>, skipHistoryStack?: boolean) => {
      activeEditor.update(
        () => {
          const selection = $getSelection();
          if (selection !== null) {
            $patchStyleText(selection, styles);
          }
        },
        skipHistoryStack ? { tag: "historic" } : {},
      );
    },
    [activeEditor],
  );

  const onFontColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ color: value }, skipHistoryStack);
    },
    [applyStyleText],
  );

  const onBgColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ "background-color": value }, skipHistoryStack);
    },
    [applyStyleText],
  );

  const insertLink = useCallback(() => {
    if (!toolbarState.isLink) {
      setIsLinkEditMode(true);
      activeEditor.dispatchCommand(
        TOGGLE_LINK_COMMAND,
        sanitizeUrl("https://"),
      );
    } else {
      setIsLinkEditMode(false);
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [activeEditor, setIsLinkEditMode, toolbarState.isLink]);

  const onCodeLanguageSelect = useCallback(
    (value: string) => {
      activeEditor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(value);
          }
        }
      });
    },
    [activeEditor, selectedElementKey],
  );
  const insertGifOnClick = (payload: InsertImagePayload) => {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
  };

  const canViewerSeeInsertDropdown = !toolbarState.isImageCaption;
  const canViewerSeeInsertCodeButton = !toolbarState.isImageCaption;

  return (
			<div className="flex mb-px bg-white p-1 rounded-[10px] items-center overflow-x-auto h-12 border top-0 z-2">
				<Button
					disabled={!toolbarState.canUndo || !isEditable}
					onClick={() => {
						activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
					}}
					title={IS_APPLE ? "Undo (⌘Z)" : "Undo (Ctrl+Z)"}
					variant="ghost"
					size="icon"
					className={cn("flex-shrink-0", !isEditable && "opacity-50")}
					aria-label="Undo"
				>
					<Undo2 className="h-4 w-4" />
				</Button>
				<Button
					disabled={!toolbarState.canRedo || !isEditable}
					onClick={() => {
						activeEditor.dispatchCommand(REDO_COMMAND, undefined);
					}}
					title={IS_APPLE ? "Redo (⇧⌘Z)" : "Redo (Ctrl+Y)"}
					variant="ghost"
					size="icon"
					className={cn("flex-shrink-0", !isEditable && "opacity-50")}
					aria-label="Redo"
				>
					<Redo2 className="h-4 w-4" />
				</Button>
				<Divider />
				{toolbarState.blockType in blockTypeToBlockName &&
					activeEditor === editor && (
						<>
							<BlockFormatDropDown
								disabled={!isEditable}
								blockType={toolbarState.blockType}
								rootType={toolbarState.rootType}
								editor={activeEditor}
							/>
							<Divider />
						</>
					)}
				{toolbarState.blockType === "code" ? (
					<DropdownMenu>
						<DropdownMenuTrigger asChild disabled={!isEditable}>
							<Button
								variant="ghost"
								size="sm"
								className={cn(
									"flex items-center gap-1 h-8",
									!isEditable && "opacity-50",
								)}
							>
								{getLanguageFriendlyName(toolbarState.codeLanguage)}
								<ChevronDown className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start">
							<DropdownMenuGroup>
								{CODE_LANGUAGE_OPTIONS.map(([value, name]) => (
									<DropdownMenuItem
										key={value}
										onClick={() => onCodeLanguageSelect(value)}
										className={cn(
											value === toolbarState.codeLanguage && "bg-accent",
										)}
									>
										<span>{name}</span>
									</DropdownMenuItem>
								))}
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					<>
						<FontDropDown
							disabled={!isEditable}
							style={"font-family"}
							value={toolbarState.fontFamily}
							editor={activeEditor}
						/>
						<Divider />
						<FontSize
							selectionFontSize={toolbarState.fontSize.slice(0, -2)}
							editor={activeEditor}
							disabled={!isEditable}
						/>
						<Divider />
						<Button
							disabled={!isEditable}
							onClick={() => {
								activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
							}}
							variant="ghost"
							size="icon"
							className={cn(
								"flex-shrink-0",
								toolbarState.isBold && "bg-gray-100",
								!isEditable && "opacity-50",
							)}
							title={`Bold (${SHORTCUTS.BOLD})`}
							aria-label={`Format text as bold. Shortcut: ${SHORTCUTS.BOLD}`}
						>
							<Bold className="h-4 w-4" />
						</Button>
						<Button
							disabled={!isEditable}
							onClick={() => {
								activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
							}}
							variant="ghost"
							size="icon"
							className={cn(
								"flex-shrink-0",
								toolbarState.isItalic && "bg-gray-100",
								!isEditable && "opacity-50",
							)}
							title={`Italic (${SHORTCUTS.ITALIC})`}
							aria-label={`Format text as italics. Shortcut: ${SHORTCUTS.ITALIC}`}
						>
							<Italic className="h-4 w-4" />
						</Button>
						<Button
							disabled={!isEditable}
							onClick={() => {
								activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
							}}
							variant="ghost"
							size="icon"
							className={cn(
								"flex-shrink-0",
								toolbarState.isUnderline && "bg-gray-100",
								!isEditable && "opacity-50",
							)}
							title={`Underline (${SHORTCUTS.UNDERLINE})`}
							aria-label={`Format text to underlined. Shortcut: ${SHORTCUTS.UNDERLINE}`}
						>
							<Underline className="h-4 w-4" />
						</Button>
						{canViewerSeeInsertCodeButton && (
							<Button
								disabled={!isEditable}
								onClick={() => {
									activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
								}}
								variant="ghost"
								size="icon"
								className={cn(
									"flex-shrink-0",
									toolbarState.isCode && "bg-gray-100",
									!isEditable && "opacity-50",
								)}
								title={`Insert code block (${SHORTCUTS.INSERT_CODE_BLOCK})`}
								aria-label="Insert code block"
							>
								<Code className="h-4 w-4" />
							</Button>
						)}
						<LinkDialog
							editor={activeEditor}
							isLink={toolbarState.isLink}
							setIsLinkEditMode={setIsLinkEditMode}
						/>
						{/* <DropdownColorPicker
            disabled={!isEditable}
            buttonClassName="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            buttonAriaLabel="Formatting text color"
            buttonIconClassName="flex items-center mr-2"
            color={toolbarState.fontColor}
            onChange={onFontColorSelect}
            title="text color"
          />
          <DropdownColorPicker
            disabled={!isEditable}
            buttonClassName="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            buttonAriaLabel="Formatting background color"
            buttonIconClassName="flex items-center mr-2"
            color={toolbarState.bgColor}
            onChange={onBgColorSelect}
            title="bg color"
          /> */}
						<ElementFormatDropdown
							disabled={!isEditable}
							editor={activeEditor}
							value={toolbarState.elementFormat}
							isRTL={toolbarState.isRTL}
						/>
						<DropdownMenu>
							<DropdownMenuTrigger asChild disabled={!isEditable}>
								<Button
									variant="ghost"
									size="sm"
									className={cn(
										"flex items-center gap-1 h-8",
										!isEditable && "opacity-50",
									)}
								>
									More
									<ChevronDown className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start">
								<DropdownMenuGroup>
									<DropdownMenuItem
										onClick={() => {
											activeEditor.dispatchCommand(
												FORMAT_TEXT_COMMAND,
												"lowercase",
											);
										}}
										className={cn(toolbarState.isLowercase && "bg-accent")}
									>
										<CaseSensitive className="h-4 w-4" />
										<span>Lowercase</span>
										<DropdownMenuShortcut>
											{SHORTCUTS.LOWERCASE}
										</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => {
											activeEditor.dispatchCommand(
												FORMAT_TEXT_COMMAND,
												"uppercase",
											);
										}}
										className={cn(toolbarState.isUppercase && "bg-accent")}
									>
										<CaseSensitive className="h-4 w-4" />
										<span>Uppercase</span>
										<DropdownMenuShortcut>
											{SHORTCUTS.UPPERCASE}
										</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => {
											activeEditor.dispatchCommand(
												FORMAT_TEXT_COMMAND,
												"capitalize",
											);
										}}
										className={cn(toolbarState.isCapitalize && "bg-accent")}
									>
										<CaseSensitive className="h-4 w-4" />
										<span>Capitalize</span>
										<DropdownMenuShortcut>
											{SHORTCUTS.CAPITALIZE}
										</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => {
											activeEditor.dispatchCommand(
												FORMAT_TEXT_COMMAND,
												"strikethrough",
											);
										}}
										className={cn(toolbarState.isStrikethrough && "bg-accent")}
									>
										<Strikethrough className="h-4 w-4" />
										<span>Strikethrough</span>
										<DropdownMenuShortcut>
											{SHORTCUTS.STRIKETHROUGH}
										</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => {
											activeEditor.dispatchCommand(
												FORMAT_TEXT_COMMAND,
												"subscript",
											);
										}}
										className={cn(toolbarState.isSubscript && "bg-accent")}
									>
										<Subscript className="h-4 w-4" />
										<span>Subscript</span>
										<DropdownMenuShortcut>
											{SHORTCUTS.SUBSCRIPT}
										</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => {
											activeEditor.dispatchCommand(
												FORMAT_TEXT_COMMAND,
												"superscript",
											);
										}}
										className={cn(toolbarState.isSuperscript && "bg-accent")}
									>
										<Superscript className="h-4 w-4" />
										<span>Superscript</span>
										<DropdownMenuShortcut>
											{SHORTCUTS.SUPERSCRIPT}
										</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => {
											clearFormatting(editor);
										}}
										className="flex items-center justify-between w-full px-2 py-1 hover:bg-gray-100"
									>
										<PaintBucket className="h-4 w-4" />
										<span>Clear Formatting</span>
										<DropdownMenuShortcut>
											{SHORTCUTS.CLEAR_FORMATTING}
										</DropdownMenuShortcut>
									</DropdownMenuItem>
								</DropdownMenuGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					</>
				)}
			</div>
		);
}
