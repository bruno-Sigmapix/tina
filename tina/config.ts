import { defineConfig } from "tinacms";
import translations from "./translations";

const branch = process.env.GITHUB_BRANCH || process.env.HEAD || "main";

export default defineConfig({
  branch,

  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,

  cmsCallback: (cms) => {
    const translateDOM = () => {
      // Hide the "Cloud" section
      document.querySelectorAll("h4").forEach((h4) => {
        if (h4.textContent?.trim() === "Cloud") {
          h4.style.display = "none";
          const nextUl = h4.nextElementSibling;
          if (nextUl?.tagName === "UL") {
            (nextUl as HTMLElement).style.display = "none";
          }
        }
      });

      // Translate text nodes
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
      );
      let node: Text | null;
      while ((node = walker.nextNode() as Text | null)) {
        const trimmed = node.textContent?.trim();
        if (trimmed && translations[trimmed]) {
          node.textContent = node.textContent!.replace(trimmed, translations[trimmed]);
        }
      }
    };

    // Disconnect during mutations to avoid infinite loops
    const observer = new MutationObserver(() => {
      observer.disconnect();
      translateDOM();
      observer.observe(document.body, { childList: true, subtree: true });
    });

    translateDOM();
    observer.observe(document.body, { childList: true, subtree: true });

    return cms;
  },

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
        ui: {
          router: ({ document }) => {
            if (document._sys.filename === "home") return "/";
            return `/${document._sys.filename}`;
          },
        },
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
        ui: {
          router: () => "/tarifs",
        },
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
              { type: "number", name: "number", label: "Numéro" },
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
                label: "Détails des tarifs",
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
