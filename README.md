# POC Astro + TinaCMS + GitHub Pages

Proof of concept pour valider la stack **Astro + TinaCMS + TinaCloud**, déployée sur **GitHub Pages**.

## Structure du projet

```
content/pages/              # Contenu MDX des pages (éditable via Tina)
content/pricing/            # Contenu JSON des tarifs (éditable via Tina)
tina/config.ts              # Configuration des collections Tina + personnalisation admin
tina/translations.ts        # Traductions FR de l'interface admin
tina/deploy-token.ts        # Token de déploiement (vide par défaut, injecté en CI)
tina/__generated__/         # Fichiers générés par TinaCMS (à commiter sauf client.ts)
src/layouts/                # Layout Astro commun (nav, Tailwind CSS)
src/pages/                  # Pages Astro (index, about, contact, tarifs, contact-ok)
.github/workflows/deploy.yml  # CI/CD GitHub Actions
```

---

## 1. Prérequis

- Docker et Docker Compose
- Un compte GitHub
- Un compte TinaCloud (gratuit) : [app.tina.io](https://app.tina.io/)

---

## 2. Créer le projet sur TinaCloud

1. Aller sur [app.tina.io](https://app.tina.io/) et créer un compte
2. Cliquer sur **Add Project** et lier le repo GitHub
3. Récupérer le **Client ID** (visible dans les settings du projet)
4. Générer un **Read-Only Token** dans l'onglet **Tokens**
5. Dans **Configuration** > **Site URLs**, ajouter toutes les URLs du site :
   - `http://localhost:4321` (dev local)
   - `https://tina-cms.sigmapix.fr` (production)

   > Seule l'origine est nécessaire (pas de chemin)

---

## 3. Créer le token de déploiement (fine-grained)

Ce token permet au bouton "Publier le site" dans l'admin de déclencher un déploiement.

1. GitHub > **Settings** (profil) > **Developer settings** > **Personal access tokens** > **Fine-grained tokens**
2. Cliquer **Generate new token**
3. Configurer :
   - **Token name** : `tina-deploy` (ou autre)
   - **Expiration** : choisir une durée (ex: 90 jours)
   - **Repository access** : sélectionner uniquement le repo du projet
   - **Permissions** > **Repository permissions** > **Actions** : `Read and write`
   - Toutes les autres permissions restent à `No access`
4. Copier le token et l'ajouter comme secret `DEPLOY_TOKEN` dans le repo

> **Note sécurité** : ce token est embarqué dans le JavaScript de l'admin (visible dans le navigateur). Ses permissions sont limitées à `actions:write` — le pire qu'un attaquant puisse faire est déclencher un rebuild du site avec le contenu déjà public. Pour plus de sécurité, on pourrait passer par un proxy serverless (Cloudflare Worker, AWS Lambda) ou utiliser les webhooks TinaCloud.

---

## 4. Configurer les secrets GitHub

Dans le repo GitHub : **Settings** > **Secrets and variables** > **Actions** > **New repository secret**

| Secret           | Valeur                                         | Utilisation                                |
| ---------------- | ---------------------------------------------- | ------------------------------------------ |
| `TINA_CLIENT_ID` | Le Client ID de TinaCloud                      | Authentification auprès de TinaCloud       |
| `TINA_TOKEN`     | Le Read-Only Token de TinaCloud                | Lecture du contenu depuis TinaCloud        |
| `DEPLOY_TOKEN`   | Un fine-grained token GitHub | Bouton "Publier le site" dans l'admin      |

---

## 5. Activer GitHub Pages et le domaine personnalisé

1. Dans le repo : **Settings** > **Pages**
2. **Source** : sélectionner **GitHub Actions**
3. **Custom domain** : entrer le domaine (ex: `tina-cms.sigmapix.fr`) et cliquer **Save**
4. Cocher **Enforce HTTPS** (disponible après propagation DNS)
5. Le premier déploiement se fera manuellement (voir section 8)

---

## 6. Lancement en local (Docker)

```bash
# 1. Installer les dépendances
docker compose run --rm node sh -c "npm install"

# 2. Copier et remplir le fichier d'environnement
cp .env.example .env
# Renseigner NEXT_PUBLIC_TINA_CLIENT_ID (même valeur que TINA_CLIENT_ID) et TINA_TOKEN

# 3. Lancer le serveur de dev
docker compose run --rm -p 4321:4321 -p 4001:4001 node sh -c \
  "apk add --no-cache git && npx tinacms dev -c 'astro dev --host 0.0.0.0 --force'"
```

- Site : `http://localhost:4321/`
- Admin Tina : `http://localhost:4321/admin/`

> En mode local (sans credentials TinaCloud), Tina utilise le filesystem directement.
> Les modifications sont écrites dans `content/`.

---

## 7. Régénérer les fichiers Tina

Après toute modification de `tina/config.ts` :

```bash
docker compose run --rm node sh -c "npx tinacms build --skip-cloud-checks"
```

Cela met à jour `tina/__generated__/`. Commiter les fichiers modifiés, **sauf `client.ts`** qui contient le token TinaCloud en clair et est gitignoré. En particulier, `config.prebuild.jsx` et `_schema.json` doivent être commités.

> Le flag `--skip-cloud-checks` est optionnel. Il permet de contourner la vérification du schéma avec TinaCloud si l'indexation n'est pas encore à jour. Sans ce flag, le build peut échouer avec l'erreur "local Tina schema doesn't match remote Tina schema".

---

## 8. Déploiement

Le déploiement se fait de 3 façons :

1. **Bouton "Publier le site"** dans la sidebar de l'admin TinaCMS (déclenche un workflow_dispatch via l'API GitHub)
2. **Manuellement** depuis GitHub : onglet **Actions** > **Deploy to GitHub Pages** > **Run workflow**
3. **Cron quotidien** à 8h (heure Paris) comme filet de sécurité

> Il n'y a pas de déploiement automatique au push. C'est volontaire pour laisser le contrôle à l'éditeur.

### Flux de publication

```
1. L'éditeur modifie le contenu dans l'admin TinaCMS
2. TinaCloud sauvegarde (commit automatique sur la branche main)
3. L'éditeur clique sur "Publier le site"
4. GitHub Actions build le site (TinaCMS + Astro) et déploie sur GitHub Pages
```

---

## 9. Formulaire de contact

Le formulaire utilise [FormSubmit](https://formsubmit.co/) (service tiers gratuit).

- L'email de destination est protégé par un hash dans le code source
- Après soumission, l'utilisateur est redirigé vers `/contact-ok`
- Un honeypot (`_honey`) et un captcha sont actifs pour bloquer le spam
- Aucune configuration serveur nécessaire

### Activation initiale

Lors du premier envoi, FormSubmit envoie un email de confirmation. Il faut cliquer sur le lien pour activer le formulaire.

---

## 10. Personnalisation de l'admin TinaCMS

Tout est dans `tina/config.ts`, via le `cmsCallback` :

- **Traductions FR** : dictionnaire dans `tina/translations.ts`, appliqué via un TreeWalker sur les nœuds texte du DOM
- **Section "Cloud" masquée** : cachée via MutationObserver (éléments non nécessaires pour l'éditeur)
- **Bouton "Publier le site"** : injecté dans la sidebar via MutationObserver, appelle l'API GitHub pour déclencher un workflow_dispatch

> Ces personnalisations utilisent la manipulation DOM car TinaCMS ne fournit pas d'API native pour la traduction ou la personnalisation de la sidebar.

---

## 11. Limites identifiées

- **Visual editing (preview en temps réel)** : non fonctionnel sur GitHub Pages (nécessite un serveur SSR). L'édition via formulaire dans l'admin fonctionne normalement.
- **Site public** : GitHub Pages ne permet pas de protéger l'accès par mot de passe (sauf GitHub Enterprise).
- **Token de déploiement visible** : le fine-grained token est embarqué dans le JS du navigateur. Risque limité (permission `actions:write` uniquement).
- **Personnalisation admin fragile** : les traductions et le masquage de la section Cloud dépendent de la structure DOM de TinaCMS. Une mise à jour de TinaCMS pourrait casser ces personnalisations.
- **Indexation TinaCloud** : le fichier `config.prebuild.jsx` doit rester commité pour que TinaCloud puisse indexer le schéma. Ne pas l'ajouter au `.gitignore`.

---

## 12. Limites du plan gratuit

### GitHub Pages / Actions

- 2000 minutes d'Actions par mois (un build prend environ 1 minute)
- 1 Go de stockage pour le site
- 100 Go de bande passante par mois

### TinaCloud

- 2 utilisateurs
- 2 projets
- Nombre de modifications illimité (chaque sauvegarde = un commit Git)

---

## 13. Troubleshooting

### Le build échoue avec "local Tina schema doesn't match remote"

TinaCloud n'a pas encore indexé le dernier schéma. Solutions :
- Attendre quelques minutes et relancer le build
- Utiliser `--skip-cloud-checks` pour contourner la vérification (utilisé par défaut dans le workflow CI)
- Vérifier que `config.prebuild.jsx` est bien commité (TinaCloud en a besoin pour l'indexation)

### Le bouton "Publier le site" est gris (token manquant)

Le secret `DEPLOY_TOKEN` n'est pas configuré dans le repo GitHub, ou le site n'a pas été redéployé depuis l'ajout du secret. Vérifier dans **Settings** > **Secrets and variables** > **Actions** puis relancer un déploiement.

### `client.ts` contient un token en clair

C'est normal : TinaCMS génère ce fichier avec le token TinaCloud. Il est dans le `.gitignore` et ne doit **jamais** être commité. Si c'est déjà fait, révoquer le token dans TinaCloud (app.tina.io > Tokens) et en générer un nouveau.

### Erreur "astro: command not found" dans le workflow

Le workflow utilise `npx astro build` (et non `astro build` directement). Vérifier la commande dans `.github/workflows/deploy.yml`.
