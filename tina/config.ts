import { defineConfig } from "tinacms";

const branch = process.env.GITHUB_BRANCH || process.env.HEAD || "main";

export default defineConfig({
  branch,

  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
    basePath: "tina",
  },

  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public",
    },
  },

  schema: {
    collections: [
      {
        name: "page",
        label: "Pages",
        path: "content/pages",
        format: "mdx",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Titre",
            isTitle: true,
            required: true,
          },
          {
            type: "image",
            name: "image",
            label: "Image principale",
          },
          {
            type: "string",
            name: "metaDescription",
            label: "Meta Description (SEO)",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "rich-text",
            name: "body",
            label: "Contenu",
            isBody: true,
          },
        ],
      },
      {
        name: "pricing",
        label: "Tarifs",
        path: "content/pricing",
        format: "json",
        fields: [
          {
            type: "object",
            name: "tiers",
            label: "Formules",
            list: true,
            ui: {
              itemProps: (item: Record<string, string>) => ({
                label: item?.title,
              }),
            },
            fields: [
              { type: "number", name: "number", label: "Numero" },
              {
                type: "string",
                name: "title",
                label: "Titre",
                required: true,
              },
              {
                type: "string",
                name: "highlight",
                label: "Texte mis en avant",
                ui: { component: "textarea" },
              },
              {
                type: "rich-text",
                name: "details",
                label: "Details des tarifs",
              },
            ],
          },
          {
            type: "string",
            name: "footnote",
            label: "Note de bas de page",
            ui: { component: "textarea" },
          },
        ],
      },
    ],
  },
});
