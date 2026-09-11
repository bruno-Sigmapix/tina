# POC Astro + TinaCMS + GitHub Pages

Proof of concept pour valider la stack **Astro + TinaCMS + TinaCloud**, deployee sur **GitHub Pages**.

## Structure du projet

```
content/pages/          # Contenu Markdown (editable via Tina)
content/pricing/        # Contenu JSON des tarifs (editable via Tina)
tina/config.ts          # Configuration des collections Tina
tina/translations.ts    # Traductions FR de l'interface admin
src/components/         # Composant React pour l'edition visuelle (useTina)
src/layouts/            # Layout Astro commun (Tailwind CSS)
src/pages/              # Pages Astro (index, about, contact, tarifs, contact-ok)
.github/workflows/      # CI/CD GitHub Actions
```

## Lancement en local (Docker)

```bash
# 1. Installer les dependances
docker compose run --rm node sh -c "npm install"

# 2. Copier et remplir le fichier d'environnement
cp .env.example .env

# 3. Lancer le serveur de dev avec Tina actif
docker compose run --rm -p 4321:4321 -p 4001:4001 node sh -c \
  "apk add --no-cache git && npx tinacms dev -c 'astro dev --host 0.0.0.0 --force'"
```

- Site : `http://localhost:4321/tina/`
- Admin Tina : `http://localhost:4321/tina/admin/`

> En mode local (sans credentials TinaCloud), Tina utilise le filesystem
> directement. Les modifications sont ecrites dans `content/`.

## Regenerer les fichiers Tina

Apres toute modification de `tina/config.ts`, il faut regenerer les fichiers :

```bash
docker compose run --rm node sh -c "apk add --no-cache git && npx tinacms build"
```

Cela met a jour `tina/__generated__/` et `tina/tina-lock.json`. Ces fichiers doivent etre commites.

## Configuration TinaCloud

### 1. Creer un projet sur TinaCloud

1. Aller sur [app.tina.io](https://app.tina.io/)
2. Se connecter avec son compte GitHub
3. Creer un nouveau projet et le lier au repo
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

## Formulaire de contact

Le formulaire utilise [FormSubmit](https://formsubmit.co/) (service tiers gratuit). L'email de destination est protege par un hash dans le code source. Aucune configuration serveur necessaire.

## Personnalisation de l'admin

- **Traductions FR** : editables dans `tina/translations.ts`
- **Section Cloud masquee** : configuree dans `cmsCallback` de `tina/config.ts`

## Limites identifiees

- **Visual editing (preview en temps reel)** : non fonctionnel sur GitHub Pages (necessite SSR). L'edition via formulaire dans l'admin Tina fonctionne en prod.
- **Site public** : GitHub Pages ne permet pas de proteger l'acces par mot de passe (sauf GitHub Enterprise).

## Commandes

| Commande         | Description                                        |
| ---------------- | -------------------------------------------------- |
| `npm run dev`    | Serveur local avec Tina actif (edition visuelle)   |
| `npm run build`  | Build de production (TinaCMS build + Astro build)  |
| `npm run preview`| Preview du build en local                          |
