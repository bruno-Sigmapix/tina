# POC Astro + TinaCMS + GitHub Pages

Proof of concept pour valider la stack **Astro + TinaCMS + TinaCloud**, deployee sur **GitHub Pages**.

## Structure du projet

```
content/pages/       # Contenu Markdown (editable via Tina)
tina/config.ts       # Configuration des collections Tina
src/components/      # Composant React pour l'edition visuelle (useTina)
src/layouts/         # Layout Astro commun
src/pages/           # Pages Astro (index, about, contact)
.github/workflows/   # CI/CD GitHub Actions
```

## Lancement en local

```bash
# 1. Installer les dependances
npm install

# 2. Copier et remplir le fichier d'environnement
cp .env.example .env

# 3. Lancer le serveur de dev avec Tina actif
npm run dev
# Equivalent a : npx tinacms dev -c "astro dev"
```

Le site sera accessible sur `http://localhost:4321/tina/`.
L'interface d'administration Tina sera sur `http://localhost:4321/tina/admin/`.

> En mode local (sans credentials TinaCloud), Tina utilise le filesystem
> directement. Les modifications sont ecrites dans `content/`.

## Configuration TinaCloud

### 1. Creer un projet sur TinaCloud

1. Aller sur [app.tina.io](https://app.tina.io/)
2. Se connecter avec son compte GitHub
3. Creer un nouveau projet et le lier au repo `bruno-Sigmapix/tina`
4. Recuperer le **Client ID** et generer un **Read-Only Token**

### 2. Variables d'environnement en local

Creer un fichier `.env` a la racine :

```env
NEXT_PUBLIC_TINA_CLIENT_ID=ton-client-id
TINA_TOKEN=ton-read-only-token
```

### 3. Secrets GitHub (pour le deploiement)

Dans les **Settings** du repo GitHub > **Secrets and variables** > **Actions**, ajouter :

| Secret           | Valeur                          |
| ---------------- | ------------------------------- |
| `TINA_CLIENT_ID` | Le Client ID de TinaCloud       |
| `TINA_TOKEN`     | Le Read-Only Token de TinaCloud |

## Activer GitHub Pages

1. Aller dans **Settings** > **Pages** du repo
2. Dans **Source**, selectionner **GitHub Actions**
3. Le workflow `deploy.yml` se declenchera automatiquement a chaque push sur `main`
4. Le site sera accessible a `https://bruno-Sigmapix.github.io/tina/`

## Commandes

| Commande         | Description                                        |
| ---------------- | -------------------------------------------------- |
| `npm run dev`    | Serveur local avec Tina actif (edition visuelle)   |
| `npm run build`  | Build de production (TinaCMS build + Astro build)  |
| `npm run preview`| Preview du build en local                          |
