"use client";

import { EditorCommand, EditorCommandEmpty, EditorCommandItem, EditorRoot } from "novel";
import { slashCommand, suggestionItems } from "./slash-command";

import { handleCommandNavigation } from "novel/extensions";
import { EditorContent } from "novel";
import { defaultExtensions } from "./extensions";

export const TailwindEditor = () => {
  return (
    <EditorRoot>
      <EditorContent
        extensions={[...defaultExtensions, slashCommand]}
        editorProps={{
          handleDOMEvents: {
            keydown: (_view, event) => {
              handleCommandNavigation(event);
            },
          },
        }}
      >
        <EditorCommand className="z-50 h-auto max-h-[330px]  w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
          <EditorCommandEmpty className="px-2 text-muted-foreground">No results</EditorCommandEmpty>
          {suggestionItems.map((item) => (
            <EditorCommandItem
              value={item.title}
              onCommand={(val) => {
                // item.command(val);
              }}
              className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent `}
              key={item.title}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                {item.icon}
              </div>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </EditorCommandItem>
          ))}
        </EditorCommand>
      </EditorContent>
    </EditorRoot>
  );
};
