import React, { useState } from "react";
import "./Editor.scss";
import { gql } from "@apollo/client";
import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";

// TODO: make this code DRY
export let openEditor = (
  _onSubmit: OnSubmit,
  _textValue?: string
) => {};

export const Editor = () => {
  const [textValue, setTextValue] = useState("");
  const [onSubmit, setOnSubmit] = useState<OnSubmit>(() => { })
  const [displayEditor, setDisplayEditor] = useState(false);

  openEditor = (
    _onSubmit,
    _textValue = "",
  ) => {
    setTextValue(_textValue);
    // Bit of hack
    setOnSubmit(() => (textValue: string) => _onSubmit(textValue));
    setDisplayEditor(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (textValue === "") return;

    onSubmit(textValue);

    setDisplayEditor(false);
  };

  const handleClose = () => {
    setTextValue("");
    setDisplayEditor(false);
  };

  return displayEditor ? (
    <div className="editor-container">
      <form
        onSubmit={handleSubmit}
        className="editor"
        id="editor"
        name="editor"
      >
        <MDEditor
          value={textValue}
          // @ts-ignore
          onChange={setTextValue}
          id="editor-text"
          previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
          height={"50vh"}
        />
        <svg id="close-button" onClick={handleClose}>
          <use href="./assets/images/svg-bundle.svg#close-button-2" />
        </svg>
        <label>
          <input type="submit" style={{ display: "none" }} />
          <svg id="submit-button">
            <use
              href="./assets/images/svg-bundle.svg#ok"
              onClick={handleSubmit}
            />
          </svg>
        </label>
      </form>
    </div>
  ) : (
    <></>
  );
};

Editor.fragments = {
  message: gql`
    fragment AddResponse on Message {
      messageId
      group {
        groupId
      }
    }
  `,
};

export type OnSubmit = (text: string) => any;

export type EditorGQLData = {
  messageId: string;
  group: { groupId: string };
};

export type EditorProps = {};
