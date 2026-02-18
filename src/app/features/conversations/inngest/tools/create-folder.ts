import { z } from "zod";
import { createTool } from "@inngest/agent-kit";
import { convex } from "@/lib/convex-client";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

interface CreateFolderToolOptions {
  internalKey: string;
  projectId: Id<"projects">;
}

const paramsSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  parentId: z.string(),
});

export const createCreateFolderTool = ({
  internalKey,
  projectId,
}: CreateFolderToolOptions) => {
  return createTool({
    name: "createFolder",
    description: "Create a new folderr in the project",
    parameters: z.object({
      name: z.string().describe("The name of the folder to create"),
      parentId: z
        .string()
        .describe(
          "The ID (not name!) of the parent folder from listFiles, or empt string for root level",
        ),
    }),
    handler: async (params, { step: toolStep }) => {
      const parsed = paramsSchema.safeParse(params);
      if (!parsed.success) {
        return `Error: ${parsed.error.issues[0].message}`;
      }

      const { parentId, name } = parsed.data;

      try {
        return await toolStep?.run("create-folder", async () => {
          // Only validate parentId if one was actually provided
          if (parentId) {
            try {
              const parentFolder = await convex.query(api.system.getFileById, {
                internalKey,
                fileId: parentId as Id<"files">,
              });

              if (!parentFolder) {
                return `Error: Parent folder with ID "${parentId}" not found. Use listFiles to get valid folder IDs.`;
              }
              if (parentFolder.type !== "folder") {
                return `Error: The ID "${parentId}" is a file, not a folder. Use a folder ID as parentId.`;
              }
            } catch (error) {
              return `Error: Invalid parentId "${parentId}". Use listFiles to get valid folder IDs.`;
            }
          }

          // ✅ Create folder whether parentId is provided or not
          const folderId = await convex.mutation(api.system.createFolder, {
            internalKey,
            projectId,
            name,
            parentId: parentId ? (parentId as Id<"files">) : undefined,
          });

          return `Folder created with Id: ${folderId}`;
        });
      } catch (error) {
        return `Error creating folder: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  });
};
