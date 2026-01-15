// import { create } from "zustand";
// import { Id } from "../../../../../convex/_generated/dataModel";

// interface TabState {
//   openTabs: Id<"files">[];
//   activeTabId: Id<"files"> | null;
//   previewTabId: Id<"files"> | null;
// }

// const defaultTabState: TabState = {
//   openTabs: [],
//   activeTabId: null,
//   previewTabId: null,
// };

// interface EditorStore {
//   tabs: Map<Id<"projects">, TabState>;

//   getTabState: (projectId: Id<"projects">) => TabState;

//   openFile: (
//     projectId: Id<"projects">,
//     fileId: Id<"files">,
//     options: { pinned: boolean }
//   ) => void;

//   closeTab: (projectId: Id<"projects">, fileId: Id<"files">) => void;

//   closeAllTabs: (projectId: Id<"projects">) => void;

//   setActiveTab: (projectId: Id<"projects">, fileId: Id<"files">) => void;
// }
// export const useEditorStore = create<EditorStore>()((set, get) => ({
//   tabs: new Map(),

//   getTabState: (projectId) => {
//     return get().tabs.get(projectId) ?? defaultTabState;
//   },
//   openFile: (projectId, fileId, { pinned }) => {
//     const tabs = new Map(get().tabs);
//     const state = tabs.get(projectId) ?? defaultTabState;
//     const { openTabs, previewTabId } = state;
//     const isOpen = openTabs.includes(fileId);

//     // Case 1: Opening as preview - replace existing preview or add new
//     if (!isOpen && !pinned) {
//       const newTabs = previewTabId
//         ? openTabs.map((id) => (id === previewTabId ? fileId : id))
//         : [...openTabs, fileId];

//       tabs.set(projectId, {
//         openTabs: newTabs,
//         activeTabId: fileId,
//         previewTabId: fileId,
//       });
//       set({ tabs });
//       return;
//     }

//     // Case 2: Opening as pinned - add new tab
//     if (!isOpen && pinned) {
//       tabs.set(projectId, {
//         ...state,
//         openTabs: [...openTabs, fileId],
//         activeTabId: fileId,
//       });
//       set({ tabs });
//       return;
//     }
//     // Case 3 : File already open - just active ( and pin if double-clicked)
//     const shouldPin = pinned && previewTabId === fileId;
//     tabs.set(projectId, {
//       ...state,
//       activeTabId: fileId,
//       previewTabId: shouldPin ? null : previewTabId,
//     });
//     set({ tabs });
//   },

//   closeTab: (projectId, fileId) => {
//     const tabs = new Map(get().tabs);
//     const state = tabs.get(projectId) ?? defaultTabState;
//     const { openTabs, activeTabId, previewTabId } = state;
//     const tabIndex = openTabs.indexOf(fileId);

//     if (tabIndex === -1) return;

//     const newTabs = openTabs.filter((id) => id !== fileId);

//     let newActiveTabId = activeTabId;

//     if (activeTabId === fileId) {
//       if (newTabs.length === 0) {
//         newActiveTabId = null;
//       } else if (tabIndex >= newTabs.length) {
//         newActiveTabId = newTabs[newTabs.length - 1];
//       } else {
//         newActiveTabId = newTabs[tabIndex];
//       }
//     }
//     tabs.set(projectId, {
//       openTabs: newTabs,
//       activeTabId: newActiveTabId,
//       previewTabId: previewTabId === fileId ? null : previewTabId,
//     });
//     set({ tabs });
//   },
//   closeAllTabs: (projectId) => {
//     const tabs = new Map(get().tabs);
//     tabs.set(projectId, defaultTabState);
//     set({ tabs });
//   },
//   setActiveTab: (projectId, fileId) => {
//     const tabs = new Map(get().tabs);
//     const state = tabs.get(projectId) ?? defaultTabState;
//     tabs.set(projectId, { ...state, activeTabId: fileId });
//     set({ tabs });
//   },
// }));

// Import zustand - a tool that helps remember things in your app (like a memory box)
import { create } from "zustand";
// Import special ID types that identify files and projects uniquely
import { Id } from "../../../../../convex/_generated/dataModel";

/**
 * TabState: Information about all the tabs open for ONE project
 * Think of it like: "What coloring books are open on my table right now?"
 */
interface TabState {
  openTabs: Id<"files">[]; // List of all file IDs that have tabs open (all books on table)
  activeTabId: Id<"files"> | null; // Which file you're currently looking at (the book you're coloring)
  previewTabId: Id<"files"> | null; // Which file is just being "peeked at" (not committed to keeping open)
}

/**
 * Default starting state - when you first start, no tabs are open
 * Like a clean, empty table
 */
const defaultTabState: TabState = {
  openTabs: [], // No files open yet
  activeTabId: null, // Not looking at any file
  previewTabId: null, // Not previewing any file
};

/**
 * EditorStore: The main storage that tracks tabs for ALL projects
 * Think of it like: A big organizer that remembers the state of every project's table
 */
interface EditorStore {
  // A Map that connects each project to its tab state
  // Like having different tables for different projects
  tabs: Map<Id<"projects">, TabState>;

  // Function to get the tab state for a specific project
  getTabState: (projectId: Id<"projects">) => TabState;

  // Function to open a file (either as preview or pinned)
  openFile: (
    projectId: Id<"projects">, // Which project
    fileId: Id<"files">, // Which file to open
    options: { pinned: boolean } // Should it stay open permanently (pinned) or just preview?
  ) => void;

  // Function to close a specific tab
  closeTab: (projectId: Id<"projects">, fileId: Id<"files">) => void;

  // Function to close ALL tabs in a project (clear the whole table)
  closeAllTabs: (projectId: Id<"projects">) => void;

  // Function to switch which tab is active (which file you're looking at)
  setActiveTab: (projectId: Id<"projects">, fileId: Id<"files">) => void;
}

/**
 * Create the actual store using Zustand
 * This is like building the memory box that will track everything
 */
export const useEditorStore = create<EditorStore>()((set, get) => ({
  // Start with an empty Map - no projects have any tabs open yet
  tabs: new Map(),

  /**
   * getTabState: Look up what tabs are open for a specific project
   * If the project doesn't exist in our map yet, return the default empty state
   */
  getTabState: (projectId) => {
    return get().tabs.get(projectId) ?? defaultTabState;
  },

  /**
   * openFile: The most complex function - handles opening files with different behaviors
   * This is like deciding how to put a coloring book on your table
   */
  openFile: (projectId, fileId, { pinned }) => {
    // Create a copy of the tabs Map so we can modify it safely
    const tabs = new Map(get().tabs);

    // Get the current state for this project (or use default if none exists)
    const state = tabs.get(projectId) ?? defaultTabState;

    // Extract the current open tabs and preview tab ID
    const { openTabs, previewTabId } = state;

    // Check if this file is already open
    const isOpen = openTabs.includes(fileId);

    /**
     * CASE 1: Opening as PREVIEW (not pinned) and file is NOT already open
     * This is like: "I'm just peeking at this coloring book, not sure if I want to keep it out"
     */
    if (!isOpen && !pinned) {
      // If there's already a preview tab, REPLACE it with this new one
      // If no preview exists, just add this file to the end
      const newTabs = previewTabId
        ? openTabs.map((id) => (id === previewTabId ? fileId : id)) // Replace preview
        : [...openTabs, fileId]; // Add new

      // Update the state: new tabs list, make this active, mark as preview
      tabs.set(projectId, {
        openTabs: newTabs,
        activeTabId: fileId, // Focus on this file
        previewTabId: fileId, // Mark it as the preview tab
      });
      set({ tabs }); // Save the changes
      return;
    }

    /**
     * CASE 2: Opening as PINNED (committed) and file is NOT already open
     * This is like: "I definitely want to keep this coloring book on my table"
     */
    if (!isOpen && pinned) {
      tabs.set(projectId, {
        ...state, // Keep everything else the same
        openTabs: [...openTabs, fileId], // Add this file to the list
        activeTabId: fileId, // Make it the active one
        // Note: previewTabId stays the same (not changing preview status)
      });
      set({ tabs });
      return;
    }

    /**
     * CASE 3: File is ALREADY open - just switch to it (and maybe pin it)
     * This is like: "Oh, that coloring book is already on my table, let me focus on it"
     */
    // Should we pin it? Only if user wants to pin AND it's currently the preview
    const shouldPin = pinned && previewTabId === fileId;

    tabs.set(projectId, {
      ...state, // Keep the tabs list the same
      activeTabId: fileId, // Switch focus to this file
      previewTabId: shouldPin ? null : previewTabId, // Clear preview if we're pinning it
    });
    set({ tabs });
  },

  /**
   * closeTab: Remove a tab and figure out what to focus on next
   * This is like: "Put away this coloring book and decide which one to look at next"
   */
  closeTab: (projectId, fileId) => {
    // Create a copy of tabs Map
    const tabs = new Map(get().tabs);
    const state = tabs.get(projectId) ?? defaultTabState;
    const { openTabs, activeTabId, previewTabId } = state;

    // Find where this file is in the list
    const tabIndex = openTabs.indexOf(fileId);

    // If the file isn't even open, do nothing
    if (tabIndex === -1) return;

    // Remove this file from the list
    const newTabs = openTabs.filter((id) => id !== fileId);

    // Figure out which tab should be active next
    let newActiveTabId = activeTabId;

    // Only need to change active tab if we're closing the one that's currently active
    if (activeTabId === fileId) {
      if (newTabs.length === 0) {
        // No tabs left - nothing is active
        newActiveTabId = null;
      } else if (tabIndex >= newTabs.length) {
        // We closed the last tab - activate the new last tab
        newActiveTabId = newTabs[newTabs.length - 1];
      } else {
        // Activate the tab that's now at the same position
        // (like if you close tab #2, tab #3 slides into position #2)
        newActiveTabId = newTabs[tabIndex];
      }
    }

    // Update the state
    tabs.set(projectId, {
      openTabs: newTabs,
      activeTabId: newActiveTabId,
      previewTabId: previewTabId === fileId ? null : previewTabId, // Clear preview if it was this file
    });
    set({ tabs });
  },

  /**
   * closeAllTabs: Close every single tab in a project
   * This is like: "Clear off the entire table, put away all coloring books"
   */
  closeAllTabs: (projectId) => {
    const tabs = new Map(get().tabs);
    // Reset this project to the default empty state
    tabs.set(projectId, defaultTabState);
    set({ tabs });
  },

  /**
   * setActiveTab: Switch focus to a different tab
   * This is like: "Stop coloring in this book, start coloring in that one"
   */
  setActiveTab: (projectId, fileId) => {
    const tabs = new Map(get().tabs);
    const state = tabs.get(projectId) ?? defaultTabState;
    // Keep everything the same except change which tab is active
    tabs.set(projectId, { ...state, activeTabId: fileId });
    set({ tabs });
  },
}));
