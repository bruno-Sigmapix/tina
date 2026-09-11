// tina/config.ts
import { defineConfig } from "tinacms";

// tina/translations.ts
var translations = {
  // Sidebar
  "Media Manager": "M\xE9dias",
  "Event Log": "Journal",
  "Log Out": "D\xE9connexion",
  // Collection list
  "Sort by": "Trier par",
  "Default": "Par d\xE9faut",
  "Add Folder": "Nouveau dossier",
  "Add File": "Nouveau fichier",
  "Title": "Titre",
  "Filename": "Nom de fichier",
  "Extension": "Extension",
  "Template": "Mod\xE8le",
  "Previous": "Pr\xE9c\xE9dent",
  "Next": "Suivant",
  "You have not configured search. Read the docs": "La recherche n'est pas configur\xE9e.",
  // Buttons & actions
  "Save": "Enregistrer",
  "Save & Close": "Enregistrer et fermer",
  "Reset": "R\xE9initialiser",
  "Create New": "Cr\xE9er",
  "Delete": "Supprimer",
  "Cancel": "Annuler",
  "Confirm": "Confirmer",
  // Form / fields
  "Fields": "Champs",
  "Raw JSON": "JSON brut",
  "Raw Markdown": "Markdown brut",
  // Media / lists
  "No items": "Aucun \xE9l\xE9ment",
  "Add Item": "Ajouter",
  "Search": "Rechercher",
  "Upload": "Importer",
  "Drag and Drop": "Glisser-d\xE9poser",
  // Visual editing hint
  "TinaCMS form fields": "Les champs du formulaire",
  "will appear here.": "appara\xEEtront ici.",
  "Visual Editing Docs": "Documentation"
};
var translations_default = translations;

// tina/config.ts
var branch = process.env.GITHUB_BRANCH || process.env.HEAD || "main";
var config_default = defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,
  cmsCallback: (cms) => {
    const translateDOM = () => {
      document.querySelectorAll("h4").forEach((h4) => {
        if (h4.textContent?.trim() === "Cloud") {
          h4.style.display = "none";
          const nextUl = h4.nextElementSibling;
          if (nextUl?.tagName === "UL") {
            nextUl.style.display = "none";
          }
        }
      });
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      );
      let node;
      while (node = walker.nextNode()) {
        const trimmed = node.textContent?.trim();
        if (trimmed && translations_default[trimmed]) {
          node.textContent = node.textContent.replace(trimmed, translations_default[trimmed]);
        }
      }
    };
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
    basePath: "tina"
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public"
    }
  },
  schema: {
    collections: [
      {
        name: "page",
        label: "Pages",
        path: "content/pages",
        format: "mdx",
        ui: {
          router: ({ document: document2 }) => {
            if (document2._sys.filename === "home") return "/";
            return `/${document2._sys.filename}`;
          }
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Titre",
            isTitle: true,
            required: true
          },
          {
            type: "image",
            name: "image",
            label: "Image principale"
          },
          {
            type: "string",
            name: "metaDescription",
            label: "Meta Description (SEO)",
            ui: {
              component: "textarea"
            }
          },
          {
            type: "rich-text",
            name: "body",
            label: "Contenu",
            isBody: true
          }
        ]
      },
      {
        name: "pricing",
        label: "Tarifs",
        path: "content/pricing",
        format: "json",
        ui: {
          router: () => "/tarifs"
        },
        fields: [
          {
            type: "object",
            name: "tiers",
            label: "Formules",
            list: true,
            ui: {
              itemProps: (item) => ({
                label: item?.title
              })
            },
            fields: [
              { type: "number", name: "number", label: "Num\xE9ro" },
              {
                type: "string",
                name: "title",
                label: "Titre",
                required: true
              },
              {
                type: "string",
                name: "highlight",
                label: "Texte mis en avant",
                ui: { component: "textarea" }
              },
              {
                type: "rich-text",
                name: "details",
                label: "D\xE9tails des tarifs"
              }
            ]
          },
          {
            type: "string",
            name: "footnote",
            label: "Note de bas de page",
            ui: { component: "textarea" }
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
