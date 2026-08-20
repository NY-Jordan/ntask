# NTask

Un gestionnaire de tâches minimaliste sous forme de petit bouton flottant (FAB) toujours au premier plan sur le bureau Linux. Double-clic pour l'ouvrir en panneau complet, clic ailleurs pour le refermer — sans jamais ouvrir une grosse application.

Interface dans un style terminal/dev (police mono, accents bleus, sections `// COMMENT`).

## Stack

- [Tauri 2](https://v2.tauri.app/) — shell desktop natif (Rust)
- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Zustand — state management (UI)
- SQLite (via `tauri-plugin-sql`) — persistance locale
- `tauri-plugin-opener` — ouverture des liens dans le navigateur système
- `tauri-plugin-autostart` — démarrage automatique (intégré côté Rust)

## Prérequis Linux

- Node.js ≥ 18 et npm
- Rust (via [rustup](https://rustup.rs))
- Paquets système (Ubuntu/Debian) :

```bash
sudo apt update && sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev
```

Sur Fedora/openSUSE/Arch, voir la liste officielle des [prérequis Tauri](https://v2.tauri.app/start/prerequisites/#linux).

Vérifier les versions :

```bash
node --version
npm --version
rustc --version
cargo --version
```

## Installation

```bash
npm install
```

## Lancement en développement

```bash
npm run tauri dev
```

Démarre le serveur Vite (port 1420) puis compile et lance la fenêtre Tauri.

Sous GNOME/Mutter en session **Wayland**, le compositeur ignore le hint "always on top" envoyé par un client — le FAB ne reste alors pas au-dessus des autres fenêtres. Contournement : forcer le rendu en XWayland avec `GDK_BACKEND=x11` :

```bash
GDK_BACKEND=x11 npm run tauri dev
```

## Build

```bash
npm run tauri build
```

Génère les binaires natifs (AppImage / .deb) dans `src-tauri/target/release/bundle/`.

## Commandes principales

| Commande               | Description                              |
|-------------------------|-------------------------------------------|
| `npm run dev`            | Lance uniquement le frontend (Vite)       |
| `npm run tauri dev`      | Lance l'app desktop complète              |
| `npm run tauri build`    | Build de production (binaire natif)       |
| `npm run lint`           | Lint du code TypeScript (oxlint)          |
| `npm run build`          | Typecheck + build frontend                |

## Architecture

```text
src/
├── app/
│   └── App.tsx                    # état racine : mode du panel (fab/list/add/…), pin, câblage des hooks fenêtre
│
├── features/
│   ├── tasks/
│   │   ├── components/
│   │   │   ├── TaskFab.tsx            # bouton flottant collapsed (drag natif, double-clic pour ouvrir)
│   │   │   ├── TaskPanel.tsx          # routeur interne du panel (header, body, footer par mode)
│   │   │   ├── TaskListView.tsx       # liste du jour : recherche, filtres, sections actif/terminé, vider
│   │   │   ├── TaskItem.tsx           # ligne de tâche
│   │   │   ├── TaskForm.tsx           # formulaire création/édition (titre, description, catégorie, priorité, liens)
│   │   │   ├── TaskDetailView.tsx     # détail d'une tâche + ressources attachées
│   │   │   ├── PrioritySelector.tsx   # sélecteur segmenté low/medium/high/urgent
│   │   │   ├── UrlAttachmentField.tsx # champ d'ajout de liens dans le formulaire
│   │   │   ├── LinkManagerView.tsx    # gestion des liens (standalone + liés à une tâche), groupés par catégorie
│   │   │   ├── LinkFavicon.tsx        # favicon d'un lien dérivé de son domaine
│   │   │   └── ResizeHandle.tsx       # 8 zones de resize (bords + coins) via startResizeDragging
│   │   ├── hooks/
│   │   │   ├── useWindowMode.ts       # taille/position de la fenêtre par mode, persistance resize utilisateur
│   │   │   ├── useCloseOnBlur.ts      # ferme le panel au blur (désactivable via pin)
│   │   │   ├── useTodayTasks.ts       # tâches dues aujourd'hui/en retard (badge du FAB)
│   │   │   └── useTasksByDate.ts      # tâches créées à une date donnée (sélecteur de date du panel)
│   │   ├── store/taskStore.ts         # store Zustand (CRUD + suppression en masse)
│   │   ├── services/
│   │   │   ├── taskService.ts         # accès SQLite table `tasks`
│   │   │   └── linkService.ts         # accès SQLite table `links` (standalone + liés à une tâche)
│   │   ├── types/                     # Task, Link
│   │   └── priority.ts                # labels/couleurs/marqueurs par niveau de priorité
│   │
│   └── categories/
│       ├── components/                # CategoryBadge, CategorySelect (popup custom, pas de <select> natif), CategoryManagerView
│       ├── hooks/useCategories.ts
│       ├── store/categoryStore.ts
│       ├── services/categoryService.ts
│       ├── types/category.ts
│       └── constants.ts               # palette de couleurs proposée à la création
│
├── shared/
│   ├── components/icons.tsx           # icônes SVG inline, pas de dépendance externe
│   ├── db.ts                          # connexion SQLite partagée (singleton)
│   └── utils/date.ts
│
└── main.tsx

src-tauri/
├── src/lib.rs                 # migrations SQL, plugins, positionnement initial du FAB
├── capabilities/default.json  # permissions (sql, window resize/drag, autostart, opener)
└── tauri.conf.json            # fenêtre sans décoration, transparente, always-on-top, resizable
```

**Flux de données** : Zustand garde l'état affiché en mémoire, mais chaque mutation
écrit d'abord dans SQLite via le service concerné (`taskService`, `categoryService`,
`linkService`) puis met à jour le store. SQLite (fichier `tasks.db`, dans le dossier
de données de l'app) est la source de vérité.

**Modèle de données** (voir migrations dans `src-tauri/src/lib.rs`) :

- `tasks` — titre, description, priorité (`low`/`medium`/`high`/`urgent`), catégorie, échéance, date de création
- `categories` — nom + couleur
- `links` — URL, label, `task_id` optionnel (lien attaché à une tâche) et/ou `category_id` optionnel (lien standalone catégorisé) ; le favicon n'est pas stocké, il est dérivé de l'URL à l'affichage

**Navigation du panel** : un seul état `PanelMode` (`fab | list | add | edit | detail | categories | links`)
piloté depuis `App.tsx`, qui contrôle à la fois la vue affichée et la taille/position
de la fenêtre OS (`useWindowMode`). Il n'y a pas de router — `TaskPanel` fait un
simple `switch` sur le mode.

## Comportement de la fenêtre

- **FAB** (84×84px) : draggable nativement (`data-tauri-drag-region`), double-clic pour ouvrir, badge rouge si des tâches du jour restent à faire.
- **Panel** : redimensionnable à la souris sur les 8 bords/coins (`ResizeHandle`) ; la taille choisie est sauvegardée dans `localStorage` et réappliquée à la prochaine ouverture, quel que soit le sous-écran affiché.
- **Fermeture** : au blur de la fenêtre (comportement popover), sauf si le panel est épinglé (bouton pin dans le header).
- **Retour au FAB** : le FAB réapparaît exactement là où était le coin bas-droit du panel.

## Fonctionnalités

- Tâches : titre, description, priorité (4 niveaux), catégorie, échéance, ressources (liens) attachées
- Vue du jour par défaut, sélecteur de date pour voir les tâches créées un autre jour
- Recherche + filtres (par catégorie, par urgence) + suppression en masse d'une journée
- Catégories : nom + couleur, gérables (création/suppression), affichées en badge partout
- Liens : gestion dédiée (standalone ou attachés à une tâche), groupés par catégorie, favicon automatique, ouverture dans le navigateur système
- Détail de tâche : édition, suppression, bascule terminé/en cours

## Problèmes Linux/Tauri connus

- **`error: failed to run custom build command for webkit2gtk-sys`** : les paquets
  système listés ci-dessus manquent. Réinstalle-les puis relance.
- **Le FAB ne reste pas always-on-top** : limitation Wayland/Mutter (GNOME) — les
  compositeurs Wayland n'honorent pas la demande "always on top" d'un client.
  Lancer avec `GDK_BACKEND=x11` (voir plus haut).
- **La fenêtre ne descend pas sous ~200×200px** : bug connu de WebKitGTK — quand
  `resizable: false`, GTK négocie la taille de la fenêtre selon la taille
  "naturelle" du contenu au lieu d'honorer `setSize()`. C'est pour ça que
  `resizable: true` est utilisé même pour le FAB (verrouillé via `setMinSize`/
  `setMaxSize` égaux plutôt que `resizable: false`).
- **Icône système (appindicator)** manquante sous certains DE minimalistes : le
  paquet `libayatana-appindicator3-dev` doit être installé avant le build.
- **`symbol lookup error: ... undefined symbol: __libc_pthread_init` au lancement** :
  survient quand `npm run tauri dev` est exécuté depuis un terminal intégré d'un
  éditeur installé via Snap (ex. VS Code snap), qui injecte des variables d'env
  (`GTK_PATH`, `GDK_PIXBUF_MODULEDIR`, `GIO_MODULE_DIR`, `LOCPATH`, …) pointant vers
  les bibliothèques du snap au lieu de celles du système. Le script npm `tauri`
  (voir `package.json`) neutralise déjà ces variables via `env -u ...` — si le
  problème persiste, lance la commande depuis un terminal système (non-snap).
- **Migrations SQL** : le texte SQL d'une migration déjà appliquée ne doit **jamais**
  être modifié (même juste l'indentation) — `tauri-plugin-sql` (via sqlx) calcule un
  checksum du texte et refuse de démarrer si une migration existante a changé
  (`migration X was previously applied but has been modified`). Toujours ajouter
  une nouvelle migration plutôt que d'éditer une migration existante.

## Prochaines améliorations possibles

- Icône dans la barre système (tray) avec show/hide
- Raccourci clavier global pour afficher/masquer le panel
- Édition de la couleur/nom d'une catégorie existante
- Réordonnancement manuel des tâches
- Export/import des données
