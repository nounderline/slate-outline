import {
    Slate,
    Editable,
    withReact,
    useSlateStatic,
    useReadOnly,
    ReactEditor,
} from "slate-react"
import {
    Editor,
    Transforms,
    Range,
    Point,
    createEditor,
    Descendant,
    Element as SlateElement,
} from "slate"
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
} from "@dnd-kit/core"
import { useCallback, useEffect, useMemo } from "react"
import { withHistory } from "slate-history"
import { css } from "@emotion/css"

const initialValue: Descendant[] = [
    {
        type: "paragraph",
        children: [
            {
                text: "With Slate you can build complex block types that have their own embedded content and behaviors, like rendering checkboxes inside check list items!",
            },
        ],
    },
    {
        type: "check-list-item",
        checked: true,
        children: [{ text: "Slide to the left." }],
    },
    {
        type: "check-list-item",
        checked: true,
        children: [{ text: "Slide to the right." }],
    },
    {
        type: "check-list-item",
        checked: false,
        children: [{ text: "Criss-cross." }],
    },

    {
        type: "paragraph",
        children: [{ text: "Try it out for yourself!" }],
        depth: 2,
    },
]

const DroppableList = (props) => {
    const droppable = useDroppable({
        id: "droppable",
    })

    return
    ;<div ref={droppable.setNodeRef}>{props.children}</div>
}

const CheckListsExample = () => {
    const renderElement = useCallback((props) => <Element {...props} />, [])
    const editor = useMemo(
        () => withReact(withChecklists(withHistory(createEditor()))),
        []
    )

    return (
        <Slate editor={editor} value={initialValue}>
            <DndContext
                onDragEnd={(e) => {
                    console.log("onDragEnd", e)
                }}
            >
                <Editable
                    renderElement={renderElement}
                    placeholder="Get to work…"
                    spellCheck
                    autoFocus
                />
            </DndContext>
        </Slate>
    )
}

const withChecklists = (editor: Editor) => {
    const { deleteBackward } = editor

    editor.deleteBackward = (...args) => {
        const { selection } = editor

        if (selection && Range.isCollapsed(selection)) {
            const [match] = Editor.nodes(editor, {
                match: (n) =>
                    !Editor.isEditor(n) &&
                    SlateElement.isElement(n) &&
                    n.type === "check-list-item",
            })

            if (match) {
                const [, path] = match
                const start = Editor.start(editor, path)

                if (Point.equals(selection.anchor, start)) {
                    const newProperties: Partial<SlateElement> = {
                        type: "paragraph",
                    }
                    Transforms.setNodes(editor, newProperties, {
                        match: (n) =>
                            !Editor.isEditor(n) &&
                            SlateElement.isElement(n) &&
                            n.type === "check-list-item",
                    })
                    return
                }
            }
        }

        deleteBackward(...args)
    }

    return editor
}

const Element = (props) => {
    const draggable = useDraggable({
        id: Math.random().toString(),
    })

    console.log(props)

    switch (props.element.type) {
        case "check-list-item":
            return <CheckListItemElement {...props} />
        default:
            return (
                <p
                    {...props.attributes}
                    ref={(el) => {
                        props.attributes.ref(el)
                        draggable.setNodeRef(el)
                    }}
                    style={{ marginLeft: (props.element.depth || 0) * 15 }}
                >
                    <button
                        {...draggable.listeners}
                        {...draggable.attributes}
                        className={css`
                            color: red;
                        `}
                        contentEditable={false}
                    >
                        Drag
                    </button>
                    {props.children}
                </p>
            )
    }
}

const CheckListItemElement = ({ attributes, children, element }) => {
    const editor = useSlateStatic()
    const readOnly = useReadOnly()
    const { checked } = element
    return (
        <div
            {...attributes}
            className={css`
                display: flex;
                flex-direction: row;
                align-items: center;
                & + & {
                    margin-top: 0;
                }
            `}
        >
            <span
                contentEditable={false}
                className={css`
                    margin-right: 0.75em;
                `}
            >
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => {
                        const path = ReactEditor.findPath(editor, element)
                        const newProperties: Partial<SlateElement> = {
                            checked: event.target.checked,
                        }
                        Transforms.setNodes(editor, newProperties, { at: path })
                    }}
                />
            </span>
            <span
                contentEditable={!readOnly}
                suppressContentEditableWarning
                className={css`
                    flex: 1;
                    opacity: ${checked ? 0.666 : 1};
                    text-decoration: ${!checked ? "none" : "line-through"};
                    &:focus {
                        outline: none;
                    }
                `}
            >
                {children}
            </span>
        </div>
    )
}

export default CheckListsExample
