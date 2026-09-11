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
var deployToken = process.env.GITHUB_DEPLOY_TOKEN || "";
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
    if (deployToken) {
      const injectDeployButton = () => {
        if (document.getElementById("deploy-btn")) return;
        const separator = document.querySelector(
          ".grow.my-4.border-b.border-gray-200"
        );
        if (!separator) return;
        const btn = document.createElement("button");
        btn.id = "deploy-btn";
        btn.className = "text-lg py-2 whitespace-nowrap flex items-center text-white bg-green-600 hover:bg-green-700 rounded-lg px-4 my-2 w-full justify-center font-medium transition-colors";
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg> Publier le site';
        btn.addEventListener("click", async () => {
          btn.disabled = true;
          btn.textContent = "Publication en cours...";
          btn.classList.add("opacity-60", "cursor-not-allowed");
          try {
            const res = await fetch(
              "https://api.github.com/repos/bruno-Sigmapix/tina/actions/workflows/deploy.yml/dispatches",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${deployToken}`,
                  Accept: "application/vnd.github+json"
                },
                body: JSON.stringify({ ref: "main" })
              }
            );
            if (res.status === 204) {
              btn.textContent = "Publication lancee !";
              btn.classList.replace("bg-green-600", "bg-blue-600");
              setTimeout(() => {
                btn.disabled = false;
                btn.classList.remove("opacity-60", "cursor-not-allowed");
                btn.classList.replace("bg-blue-600", "bg-green-600");
                btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg> Publier le site';
              }, 5e3);
            } else {
              btn.textContent = "Erreur (voir console)";
              console.error("Deploy failed:", res.status, await res.text());
            }
          } catch (err) {
            btn.textContent = "Erreur reseau";
            console.error("Deploy error:", err);
          }
        });
        separator.parentNode?.insertBefore(btn, separator);
      };
      const deployObserver = new MutationObserver(injectDeployButton);
      injectDeployButton();
      deployObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
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
            if (document2._sys.filename === "home") return "/tina/";
            return `/tina/${document2._sys.filename}`;
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
          router: () => "/tina/tarifs"
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
