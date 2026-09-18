import { defineConfig } from "tinacms";
import translations from "./translations";
import { deployToken } from "./deploy-token";

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

    // Deploy button in sidebar
    const injectDeployButton = () => {
      if (document.getElementById("deploy-btn")) return;
      // Find the separator line before "Event Log" / "Journal"
      const separator = document.querySelector(
        ".grow.my-4.border-b.border-gray-200",
      );
      if (!separator) return;

      const btn = document.createElement("button");
      btn.id = "deploy-btn";

      if (!deployToken) {
        btn.className =
          "text-lg py-2 whitespace-nowrap flex items-center text-white bg-gray-400 rounded-lg px-4 my-2 w-full justify-center font-medium cursor-not-allowed";
        btn.textContent = "Publier (token manquant)";
        btn.disabled = true;
      } else {
        btn.className =
          "text-lg py-2 whitespace-nowrap flex items-center text-white bg-green-600 hover:bg-green-700 rounded-lg px-4 my-2 w-full justify-center font-medium transition-colors";
        btn.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg> Publier le site';

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
                  Accept: "application/vnd.github+json",
                },
                body: JSON.stringify({ ref: "main" }),
              },
            );
            if (res.status === 204) {
              btn.textContent = "Publication lancée !";
              btn.classList.replace("bg-green-600", "bg-blue-600");
              setTimeout(() => {
                btn.disabled = false;
                btn.classList.remove("opacity-60", "cursor-not-allowed");
                btn.classList.replace("bg-blue-600", "bg-green-600");
                btn.innerHTML =
                  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg> Publier le site';
              }, 5000);
            } else {
              btn.textContent = "Erreur (voir console)";
              console.error("Deploy failed:", res.status, await res.text());
            }
          } catch (err) {
            btn.textContent = "Erreur réseau";
            console.error("Deploy error:", err);
          }
        });
      }

      separator.parentNode?.insertBefore(btn, separator);
    };

    const deployObserver = new MutationObserver(injectDeployButton);
    injectDeployButton();
    deployObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return cms;
  },

  build: {
    outputFolder: "admin",
    publicFolder: "public",
    basePath: "",
    // Nécessaire pour accéder à l'admin depuis l'hôte quand `tinacms dev`
    // tourne dans Docker : sans ça, le serveur Vite interne (port 4001)
    // rejette les connexions qui ne viennent pas de la loopback locale.
    host: "0.0.0.0",
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
            const slug = document._sys.breadcrumbs.join("/");
            return slug.toLowerCase() === "home" ? "/" : `/${slug}`;
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
            type: "string",
            name: "metaDescription",
            label: "Meta Description (SEO)",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "object",
            name: "blocks",
            label: "Blocs de contenu",
            list: true,
            ui: {
              visualSelector: true,
              itemProps: (item: Record<string, string>) => ({
                label: item?.heading || item?.label,
              }),
            },
            templates: [
              {
                name: "hero",
                label: "Hero",
                fields: [
                  {
                    type: "string",
                    name: "heading",
                    label: "Titre",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "subheading",
                    label: "Sous-titre",
                    ui: { component: "textarea" },
                  },
                  {
                    type: "image",
                    name: "image",
                    label: "Image",
                  },
                  {
                    type: "string",
                    name: "ctaLabel",
                    label: "Texte du bouton",
                  },
                  {
                    type: "string",
                    name: "ctaUrl",
                    label: "Lien du bouton",
                  },
                ],
              },
              {
                name: "content",
                label: "Texte",
                fields: [
                  {
                    type: "rich-text",
                    name: "body",
                    label: "Contenu",
                  },
                ],
              },
              {
                name: "imageText",
                label: "Image + Texte",
                fields: [
                  {
                    type: "image",
                    name: "image",
                    label: "Image",
                  },
                  {
                    type: "rich-text",
                    name: "body",
                    label: "Texte",
                  },
                  {
                    type: "string",
                    name: "imagePosition",
                    label: "Position de l'image",
                    options: [
                      { value: "left", label: "Gauche" },
                      { value: "right", label: "Droite" },
                    ],
                  },
                ],
              },
              {
                name: "cta",
                label: "Appel à l'action",
                fields: [
                  {
                    type: "string",
                    name: "heading",
                    label: "Titre",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "text",
                    label: "Texte",
                    ui: { component: "textarea" },
                  },
                  {
                    type: "string",
                    name: "buttonLabel",
                    label: "Texte du bouton",
                  },
                  {
                    type: "string",
                    name: "buttonUrl",
                    label: "Lien du bouton",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "nav",
        label: "Navigation",
        path: "content/nav",
        format: "json",
        ui: {
          global: true,
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          {
            type: "object",
            name: "items",
            label: "Liens du menu",
            list: true,
            ui: {
              itemProps: (item: Record<string, string>) => ({
                label: item?.label || item?.page,
              }),
            },
            fields: [
              {
                type: "reference",
                name: "page",
                label: "Page",
                collections: ["page"],
                required: true,
              },
              {
                type: "string",
                name: "label",
                label: "Libellé personnalisé (optionnel)",
              },
            ],
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
