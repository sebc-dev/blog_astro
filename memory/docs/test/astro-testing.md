# **Guide Exhaustif pour le Test de Composants Astro avec Vitest : De la Configuration à l'Interaction DOM**

### **Introduction**

#### **Contexte : Le Défi du Test des Composants Astro**

Le framework Astro s'est imposé comme une solution de premier plan pour la construction de sites web rapides et orientés contenu. Sa particularité réside dans son architecture "server-first", où les composants Astro (fichiers .astro) sont principalement des templates HTML conçus pour être rendus côté serveur, soit lors du build (pour les sites statiques), soit à la volée (pour les sites SSR). Par défaut, Astro ne livre aucun JavaScript au client, ce qui garantit des performances exceptionnelles.  
Cette approche, bien que bénéfique pour la performance, présente un défi unique en matière de tests de composants. Les méthodologies de test traditionnelles, popularisées par des frameworks comme React ou Vue, reposent souvent sur le "montage" d'un composant dans un environnement DOM simulé (un "headless browser" comme JSDOM) pour interagir avec lui comme le ferait un utilisateur. Cependant, un composant .astro pur n'a pas de "runtime" côté client ; il n'existe que sur le serveur pour générer du HTML. Il est donc impossible de le "monter" directement dans un test de la même manière qu'un composant client. Le défi n'est pas de tester la logique d'une "île d'interactivité" (un composant React ou Svelte hydraté côté client), mais de valider la structure, le contenu et les attributs du HTML généré par le serveur à partir du composant .astro lui-même.

#### **La Solution Moderne : Vitest et l'API Container d'Astro**

Face à ce défi, la communauté et l'équipe Astro ont développé une solution moderne et robuste qui répond précisément au besoin de tester le contenu réel des composants sans avoir recours à des mocks. Cette solution repose sur l'utilisation conjointe de deux outils puissants :

1. **Vitest** : Un framework de test de nouvelle génération, natif de Vite, qui s'intègre parfaitement à l'écosystème d'Astro. Il hérite de la configuration de Vite, ce qui assure une cohérence entre l'environnement de développement et celui de test.
2. **L'API Container d'Astro** : Introduite pour permettre le rendu de composants .astro en isolation, en dehors du processus de build complet. Cette API a été explicitement conçue pour des cas d'usage comme le test unitaire et d'intégration, permettant de générer la sortie HTML d'un composant directement dans un script Node.js.

Il est important de noter que cette API est actuellement marquée comme experimental. Cela signifie qu'elle est fonctionnelle et promue par l'équipe Astro pour les tests, mais que sa signature pourrait connaître des ajustements dans les versions futures. Une consultation régulière de la documentation officielle est donc recommandée.

#### **Aperçu de la Méthodologie**

Ce guide détaillé présentera une méthodologie complète en deux temps, qui est devenue la norme pour tester les composants Astro de manière fiable et maintenable :

1. **Rendu Côté Serveur en Mémoire** : Dans un premier temps, nous utiliserons l'API Container d'Astro au sein d'un test Vitest pour prendre un fichier de composant .astro et le rendre en une chaîne de caractères HTML. Cette étape simule fidèlement le travail du serveur Astro.
2. **Analyse et Assertion dans un DOM Simulé** : Dans un second temps, nous prendrons cette chaîne HTML et l'injecterons dans un environnement DOM simulé par jsdom. Une fois le HTML "vivant" dans ce DOM, nous pourrons utiliser des bibliothèques de test sémantique comme @testing-library/dom pour interroger sa structure et faire des assertions robustes, vérifiant non seulement le contenu mais aussi l'accessibilité et la structure, comme le percevrait un utilisateur final.

Cette approche permet de tester le véritable rendu du composant, répondant ainsi parfaitement à la demande de l'utilisateur de tester le contenu réel sans "mocking".

## **Section 1 : Mise en Place de l'Environnement de Test avec Vitest et Astro**

Une configuration solide est le fondement de toute stratégie de test réussie. Cette section détaille l'installation des dépendances et la configuration des fichiers nécessaires pour créer un environnement de test robuste pour un projet Astro.

### **Installation des Dépendances Requises**

Pour commencer, il est nécessaire d'installer plusieurs paquets en tant que dépendances de développement. Ces outils fonctionneront de concert pour exécuter les tests, simuler un environnement de navigateur et fournir des assertions puissantes.  
Exécutez la commande suivante correspondant à votre gestionnaire de paquets :  
**npm**  
`npm install -D vitest jsdom @testing-library/dom @testing-library/jest-dom`

**yarn**  
`yarn add -D vitest jsdom @testing-library/dom @testing-library/jest-dom`

**pnpm**  
`pnpm add -D vitest jsdom @testing-library/dom @testing-library/jest-dom`

Détaillons le rôle de chaque dépendance :

- **vitest** : Le framework de test qui va orchestrer et exécuter nos fichiers de test. Il est conçu pour fonctionner avec Vite, ce qui le rend idéal pour les projets Astro.
- **jsdom** : Une implémentation purement JavaScript du DOM et des API du navigateur qui s'exécute dans Node.js. Vitest l'utilisera pour créer un environnement où nous pourrons manipuler et interroger le HTML de nos composants comme s'ils étaient dans un vrai navigateur. C'est une dépendance cruciale pour utiliser Testing Library. Une alternative est happy-dom, mais jsdom est généralement recommandé pour sa compatibilité plus étendue.
- **@testing-library/dom** : La bibliothèque de base de la famille Testing Library. Elle fournit des utilitaires pour interroger le DOM d'une manière qui ressemble à la façon dont les utilisateurs le parcourent (par rôle, par texte, par label, etc.), favorisant ainsi des tests plus robustes et maintenables.
- **@testing-library/jest-dom** : Une bibliothèque complémentaire qui ajoute des "matchers" personnalisés et sémantiques à l'API expect de Vitest. Au lieu d'écrire expect(element).not.toBe(null), nous pourrons écrire expect(element).toBeInTheDocument(), ce qui rend les tests beaucoup plus lisibles et expressifs.

### **Configuration Fondamentale : vitest.config.ts**

Le cœur de notre configuration de test réside dans le fichier vitest.config.ts (ou .js), à placer à la racine de votre projet. C'est ici que nous allons indiquer à Vitest comment interagir avec notre projet Astro.

#### **L'utilitaire getViteConfig**

Astro exporte une fonction utilitaire essentielle, getViteConfig, depuis le paquet astro/config. Son rôle est de charger la configuration Vite de votre projet Astro (définie dans astro.config.mjs) et de la fusionner avec la configuration spécifique à Vitest. Cela garantit que Vitest bénéficie de la même configuration que votre application, y compris les alias de chemin (@/components), les plugins Vite personnalisés et d'autres réglages importants. L'utilisation de cet utilitaire est la méthode officiellement recommandée pour assurer la cohérence entre les environnements.  
Créez un fichier vitest.config.ts à la racine de votre projet avec le contenu suivant :  
`/// <reference types="vitest" />`

`import { getViteConfig } from 'astro/config';`

`export default getViteConfig({`  
 `test: {`  
 `// Active les API globales de Vitest (describe, test, expect)`  
 `// pour ne pas avoir à les importer dans chaque fichier.`  
 `globals: true,`

    `// CRUCIAL : Définit l'environnement de test pour utiliser JSDOM.`
    ``// Cela crée un objet `document` et `window` global pour nos tests.``
    `environment: 'jsdom',`

    `// Spécifie un fichier de setup qui s'exécutera avant chaque suite de tests.`
    `// Idéal pour les configurations globales comme l'import des matchers jest-dom.`
    `setupFiles: ['./tests/setup.ts'],`

    `// Recommandé : isole chaque test pour éviter les fuites d'état entre les tests.`
    `isolate: true,`

`},`  
`});`

_(Configuration inspirée de )_  
Le choix de environment: 'jsdom' est fondamental. Un développeur pourrait penser qu'un environnement node par défaut suffirait, puisque renderToString ne retourne qu'une chaîne de caractères. Cependant, pour appliquer des requêtes sémantiques (getByRole, getByText) via @testing-library/dom, cette chaîne doit être analysée et insérée dans une structure DOM. L'environnement jsdom fournit l'objet document global qui sert de "récipient" pour ce HTML rendu, le rendant ainsi interrogeable. Sans cet environnement, nous serions limités à des assertions de chaînes de caractères fragiles.

### **Configuration Avancée : Le Fichier setup.ts**

Le fichier de setupFiles configuré ci-dessus est l'endroit idéal pour les initialisations qui doivent s'appliquer à tous vos tests. Son utilisation principale dans notre cas est d'importer les matchers de @testing-library/jest-dom.  
Créez un répertoire tests à la racine de votre projet, et à l'intérieur, un fichier setup.ts :  
`// tests/setup.ts`

`// Importe les matchers personnalisés de jest-dom pour les utiliser avec Vitest.`  
``// Cela étend l'objet `expect` de Vitest avec des assertions comme.toBeInTheDocument(),.toBeVisible(), etc.``  
`import '@testing-library/jest-dom/vitest';`

_(Source : )_  
Cette simple ligne de code améliore considérablement la lisibilité et l'expressivité de nos assertions, nous faisant passer de tests techniques à des tests qui décrivent le comportement attendu de l'interface utilisateur.

### **Configuration du package.json**

Pour faciliter l'exécution des tests, il est conventionnel d'ajouter des scripts au fichier package.json :  
`{`  
 `"scripts": {`  
 `"dev": "astro dev",`  
 `"start": "astro start",`  
 `"build": "astro build",`  
 `"preview": "astro preview",`  
 `"astro": "astro",`  
 `"test": "vitest run",`  
 `"test:watch": "vitest",`  
 `"coverage": "vitest run --coverage"`  
 `}`  
`}`

_(Source : )_

- npm run test (ou pnpm test, yarn test) exécutera toutes les suites de tests une seule fois. C'est le script à utiliser dans un pipeline d'intégration continue (CI).
- npm run test:watch lancera Vitest en mode "watch", qui réexécutera automatiquement les tests concernés à chaque modification de fichier, offrant une boucle de feedback extrêmement rapide pendant le développement.
- npm run coverage exécutera les tests et générera un rapport de couverture de code.

Cette configuration de base est désormais complète et prête à accueillir nos premiers tests de composants. Cependant, il est important de comprendre une subtilité liée à getViteConfig. Cet utilitaire lie étroitement la version de Vite utilisée par Astro à celle attendue par Vitest. Historiquement, lorsque Astro met à jour sa dépendance majeure à Vite (par exemple, de Vite 4 à 5), il peut y avoir une période où la dernière version de Vitest n'est pas encore compatible. Cela peut entraîner des erreurs de configuration, comme la fameuse erreur Object literal may only specify known properties, and 'test' does not exist in type 'UserConfig'. Si vous rencontrez ce problème, la solution est généralement de vérifier la compatibilité des versions dans les notes de version d'Astro et de Vitest, et si nécessaire, d'utiliser des overrides (pour npm/pnpm) ou des resolutions (pour yarn) dans votre package.json pour forcer l'utilisation d'une version compatible de Vite dans tout votre projet.

## **Section 2 : Le Rendu de Composants Astro en Isolation avec l'API Container**

Maintenant que notre environnement est configuré, nous pouvons nous concentrer sur le cœur de la tâche : rendre un composant .astro pour pouvoir tester sa sortie. C'est là qu'intervient l'API Container d'Astro.

### **Démystification de l'API Container**

Le rendu d'un composant Astro n'est pas trivial. Il dépend d'un contexte complexe qui inclut la configuration du site, les "renderers" pour les autres frameworks (React, Svelte, etc.), les informations de la requête, et plus encore. Tenter de reconstituer ce contexte manuellement serait extrêmement complexe et fragile.  
L'API Container a été créée spécifiquement pour résoudre ce problème. Elle agit comme une boîte noire qui encapsule toute cette complexité et expose une interface simple pour rendre des composants .astro en isolation, comme si on était dans un véritable processus de build Astro. C'est l'outil qui nous permet de réaliser précisément ce que l'utilisateur a demandé : "tester des composants en important leur contenu".

### **Utilisation de experimental_AstroContainer.create()**

La première étape consiste à créer une instance du conteneur. Dans la majorité des cas de test, cette fonction peut être appelée sans aucun argument.  
`import { experimental_AstroContainer as AstroContainer } from 'astro/container';`

`// Crée une nouvelle instance du conteneur de rendu.`  
`const container = await AstroContainer.create();`

_(Source : )_  
Cette simple ligne prépare un environnement de rendu prêt à l'emploi.

### **Rendu avec container.renderToString()**

Une fois le conteneur créé, la fonction renderToString() est utilisée pour effectuer le rendu. Elle prend deux arguments :

1. Le composant Astro à tester (importé directement).
2. Un objet optionnel contenant les options de rendu (comme les props et les slots).

Elle retourne une Promise qui se résout avec la chaîne de caractères HTML générée par le composant.  
Voici un premier test pour un composant simple. Supposons que nous ayons un composant Greeting.astro :  
`---`  
`---`  
`<div>`  
 `<h1>Bonjour, Monde!</h1>`  
`</div>`

Le test correspondant ressemblerait à ceci :  
`// tests/Greeting.test.ts`  
`import { expect, test } from 'vitest';`  
`import { experimental_AstroContainer as AstroContainer } from 'astro/container';`  
`import Greeting from '../src/components/Greeting.astro';`

`test('Greeting doit afficher un titre de bienvenue', async () => {`  
 `// 1. Créer le conteneur`  
 `const container = await AstroContainer.create();`

`// 2. Rendre le composant en chaîne de caractères`  
 `const html = await container.renderToString(Greeting);`

`// 3. Faire une assertion sur le HTML résultant`  
 `expect(html).toContain('<h1>Bonjour, Monde!</h1>');`  
`});`

### **Passer des Données Dynamiques : props et slots**

Tester des composants statiques est un bon début, mais la véritable puissance des tests se révèle lorsque nous testons des composants dynamiques. L'API Container offre un support complet pour passer des props et des slots, simulant ainsi la manière dont les composants sont utilisés dans une application réelle.

#### **Passer des props**

Les props sont passées via la propriété props dans le second argument de renderToString().  
Considérons un composant Card.astro qui accepte une prop title :  
`---`  
`interface Props {`  
 `title: string;`  
`}`

`const { title } = Astro.props;`  
`---`  
`<div class="card">`  
 `<h2>{title}</h2>`  
 `<p>Contenu de la carte.</p>`  
`</div>`

Pour tester ce composant, nous pouvons lui passer une valeur pour title :  
`// tests/Card.test.ts`  
`import { expect, test } from 'vitest';`  
`import { experimental_AstroContainer as AstroContainer } from 'astro/container';`  
`import Card from '../src/components/Card.astro';`

`test('Card doit afficher le titre passé en prop', async () => {`  
 `const container = await AstroContainer.create();`  
 `const html = await container.renderToString(Card, {`  
 `props: {`  
 `title: 'Mon Titre Dynamique'`  
 `}`  
 `});`

`expect(html).toContain('<h2>Mon Titre Dynamique</h2>');`  
`});`

_(Source : )_

#### **Passer des slots**

Les slots permettent d'injecter du contenu HTML à l'intérieur d'un composant. Ils sont passés via la propriété slots.  
**Slot par défaut (\<slot /\>)**  
Si notre composant Card.astro est modifié pour accepter du contenu via un slot par défaut :  
`---`  
`//... (props definition)`  
`---`  
`<div class="card">`  
 `<h2>{title}</h2>`  
 `<slot /> </div>`

Le test peut lui fournir du contenu HTML en utilisant la clé default :  
`test('Card doit rendre le contenu du slot par défaut', async () => {`  
 `const container = await AstroContainer.create();`  
 `const html = await container.renderToString(Card, {`  
 `props: { title: 'Titre' },`  
 `slots: {`  
 `default: '<p>Ceci est le contenu injecté dans le slot.</p>'`  
 `}`  
 `});`

`expect(html).toContain('<p>Ceci est le contenu injecté dans le slot.</p>');`  
`});`

_(Source : )_  
**Slots nommés (\<slot name="..." /\>)**  
Pour les composants avec plusieurs slots nommés, il suffit d'utiliser les noms des slots comme clés dans l'objet slots.  
`---`  
`---`  
`<html>`  
 `<body>`  
 `<header>`  
 `<slot name="header" />`  
 `</header>`  
 `<main>`  
 `<slot /> </main>`  
 `<footer>`  
 `<slot name="footer" />`  
 `</footer>`  
 `</body>`  
`</html>`

Le test correspondant :  
`test('Layout doit rendre le contenu des slots nommés', async () => {`  
 `const container = await AstroContainer.create();`  
 `const html = await container.renderToString(Layout, {`  
 `slots: {`  
 `header: '<h1>Titre du Header</h1>',`  
 `default: '<p>Contenu principal.</p>',`  
 `footer: '<span>Copyright 2025</span>'`  
 `}`  
 `});`

`expect(html).toContain('<h1>Titre du Header</h1>');`  
 `expect(html).toContain('<p>Contenu principal.</p>');`  
 `expect(html).toContain('<span>Copyright 2025</span>');`  
`});`

_(Source : )_  
Une capacité particulièrement puissante et pas toujours évidente de l'API est sa nature composable. Puisque renderToString retourne une chaîne HTML et que la propriété slots accepte des chaînes HTML, il est possible d'imbriquer des appels pour tester des intégrations de composants. Par exemple, on peut rendre un composant Card et passer son HTML résultant dans le slot d'un composant Layout. Cela permet de construire et de tester des fragments de page complexes en mémoire, reflétant la composition hiérarchique des applications réelles.  
De plus, l'API Container est le seul moyen de tester des aspects qui dépendent du contexte d'exécution global d'Astro. L'objet d'options de renderToString accepte également les clés request, params et locals. Cela permet de simuler une requête HTTP avec des en-têtes spécifiques ou des paramètres de route dynamiques, et de tester des composants qui utilisent Astro.request ou Astro.params. C'est une capacité essentielle pour des tests d'intégration approfondis.

## **Section 3 : Rédaction de Tests de Composants : Des Assertions Simples aux Interactions Complexes**

Avoir le HTML d'un composant est une chose, mais savoir comment l'interroger efficacement en est une autre. Cette section explore deux stratégies d'assertion, de la plus simple à la plus robuste, pour valider le comportement de nos composants.

### **Stratégie 1 : Assertions sur la Chaîne HTML (Approche de base)**

L'approche la plus directe consiste à traiter la sortie de renderToString comme une simple chaîne de caractères et à utiliser des méthodes comme toContain ou des expressions régulières pour vérifier la présence de certains éléments.  
`test('Composant doit contenir un titre', async () => {`  
 `const container = await AstroContainer.create();`  
 `const html = await container.renderToString(MonComposant);`

`// Assertion simple mais fragile`  
 `expect(html).toContain('<h1>Mon Titre</h1>');`  
`});`

**Avantages :**

- Simple à écrire et à comprendre.
- Ne nécessite aucune configuration supplémentaire au-delà de Vitest.

**Inconvénients :**

- **Fragilité :** Ces tests sont étroitement couplés aux détails d'implémentation. Si un développeur refactorise le \<h1\> en \<h2\>, ou ajoute une classe CSS, le test échouera, même si le comportement fonctionnel (afficher un titre) est toujours correct.
- **Manque de sémantique :** Le test ne vérifie pas si le texte "Mon Titre" est bien un titre de niveau 1 accessible. Il vérifie simplement la présence d'une sous-chaîne de caractères.

Cette approche est acceptable pour des tests très simples, mais elle conduit à une maintenance coûteuse sur des projets plus importants.

### **Stratégie 2 : Intégration avec @testing-library/dom (Approche recommandée)**

Pour des tests robustes et maintenables, l'approche recommandée est d'utiliser @testing-library/dom. La philosophie de cette bibliothèque est simple mais puissante : "Plus vos tests ressemblent à la façon dont votre logiciel est utilisé, plus ils vous donneront confiance". Au lieu de tester les détails d'implémentation, nous testons ce que l'utilisateur final voit et avec quoi il interagit.  
Le processus dans chaque test se déroule en deux étapes claires, qui reflètent l'architecture même d'Astro (rendu serveur, puis affichage dans un navigateur) :

1. **Rendu en mémoire :** Utiliser container.renderToString() pour obtenir la chaîne HTML, simulant le rendu côté serveur d'Astro.
2. **Injection et Interrogation :** Injecter ce HTML dans l'objet document fourni par jsdom (grâce à notre configuration environment: 'jsdom'), puis utiliser les requêtes sémantiques de Testing Library pour trouver des éléments et faire des assertions dessus.

Voici un exemple complet qui illustre cette méthodologie :  
`// tests/Card.test.ts`  
`import { expect, test } from 'vitest';`  
`import { screen } from '@testing-library/dom';`  
`import { experimental_AstroContainer as AstroContainer } from 'astro/container';`  
`import Card from '../src/components/Card.astro';`

`test('Card doit afficher un titre de niveau 2 accessible', async () => {`  
 `// --- Étape 1: Rendu ---`  
 `const container = await AstroContainer.create();`  
 `const html = await container.renderToString(Card, {`  
 `props: { title: 'Titre Accessible' },`  
 `slots: { default: 'Contenu de la carte.' }`  
 `});`

`// --- Étape 2: Injection ---`  
 `// On injecte le HTML rendu dans le corps du document simulé par JSDOM.`  
 `document.body.innerHTML = html;`

`// --- Étape 3: Interrogation et Assertion ---`  
 ``// On utilise `screen.getByRole` pour trouver un élément de titre (<h1>, <h2>, etc.)``  
 `// dont le nom accessible (le texte contenu) est "Titre Accessible".`  
 `// C'est ainsi qu'un lecteur d'écran identifierait cet élément.`  
 `const heading = screen.getByRole('heading', {`  
 ``name: /Titre Accessible/i, // L'option `name` est une RegExp insensible à la casse``  
 `level: 2 // On s'assure que c'est bien un <h2>`  
 `});`

`// On utilise les matchers de @testing-library/jest-dom pour des assertions lisibles.`  
 `expect(heading).toBeInTheDocument();`

`// On peut aussi chercher du texte simple.`  
 `const content = screen.getByText('Contenu de la carte.');`  
 `expect(content).toBeInTheDocument();`  
`});`

_(Synthèse de )_  
Cette approche est conceptuellement alignée avec le fonctionnement d'Astro. L'étape renderToString teste la partie "serveur" (la génération du HTML statique). L'étape d'injection dans jsdom prépare le terrain pour tester le résultat final tel qu'il apparaîtrait dans le navigateur, avant toute hydratation d'une "île" interactive. C'est @testing-library/dom qui fait le pont entre le monde serveur d'Astro et le monde client des tests, car il est le seul de la famille Testing Library à opérer sur du DOM pur, sans nécessiter une instance de composant d'un framework spécifique.

### **Tableau Comparatif des Stratégies d'Assertion**

Pour visualiser clairement les avantages de l'approche sémantique, le tableau suivant compare les deux stratégies sur plusieurs critères clés.

| Caractéristique     | Assertion sur Chaîne (toContain)                                                       | Requête Sémantique (getByRole)                                                                                                            |
| :------------------ | :------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| **Exemple de code** | expect(html).toContain('\<button\>Cliquez ici\</button\>')                             | expect(screen.getByRole('button', { name: /cliquez ici/i })).toBeInTheDocument()                                                          |
| **Robustesse**      | **Faible**. Casse si \<button\> devient \<a role="button"\> ou si du style est ajouté. | **Élevée**. Le test passe tant qu'un élément avec le rôle de bouton et le bon texte est présent.                                          |
| **Maintenabilité**  | **Faible**. Nécessite des mises à jour fréquentes lors de refactorings de balisage.    | **Élevée**. Les tests sont découplés des détails d'implémentation.                                                                        |
| **Confiance**       | **Moyenne**. Vérifie la présence de contenu textuel brut.                              | **Élevée**. Vérifie que le contenu est présent et sémantiquement correct, comme le percevrait un utilisateur ou un outil d'accessibilité. |
| **Focus**           | Détails d'implémentation (tags, classes, attributs).                                   | Comportement utilisateur et accessibilité.                                                                                                |

L'investissement initial dans la configuration de jsdom et de Testing Library est largement compensé par la création de suites de tests plus fiables, plus faciles à maintenir et qui donnent une bien plus grande confiance dans la qualité du code.

## **Section 4 : Scénarios Avancés et Guide de Dépannage**

Les projets réels sont souvent plus complexes qu'un simple composant. Cette section aborde des scénarios avancés comme le test de composants hybrides et la gestion de configurations de test multiples, ainsi qu'un guide pour résoudre les problèmes les plus courants.

### **Test de Composants Astro avec des "Îles" (React, Svelte, etc.)**

Astro excelle dans l'intégration de composants interactifs issus d'autres frameworks (React, Vue, Svelte, etc.), appelés "îles". Lorsqu'un composant .astro importe et utilise une de ces îles (par exemple, \<MonComposantReact client:load /\>), le rendu côté serveur de cette île doit être géré. L'API Container a besoin qu'on lui indique comment transformer ce composant React/Svelte en HTML.  
Pour cela, Astro fournit des "renderers" spécifiques à chaque intégration. Nous devons les charger et les fournir au conteneur lors de sa création.

#### **Utilisation de loadRenderers**

La méthode recommandée est d'utiliser la fonction loadRenderers importée du module virtuel astro:container et la fonction getContainerRenderer exportée par chaque intégration de framework (ex: @astrojs/react).  
Voici comment configurer le conteneur pour un test qui inclut un composant React :  
`import { expect, test } from 'vitest';`  
`import { experimental_AstroContainer as AstroContainer } from 'astro/container';`  
`import { loadRenderers } from 'astro:container';`  
`import { getContainerRenderer } from '@astrojs/react'; // Note: le nom peut varier, ex: reactContainerRenderer`

`// Importe le composant Astro qui contient l'île React`  
`import PageAvecReact from '../src/pages/page-avec-react.astro';`

`test('La page doit rendre correctement le composant React', async () => {`  
 `// 1. Charger les renderers nécessaires`  
 `const renderers = await loadRenderers();`

`// 2. Créer le conteneur en lui fournissant les renderers`  
 `const container = await AstroContainer.create({`  
 `renderers,`  
 `});`

`// 3. Rendre le composant Astro`  
 `const html = await container.renderToString(PageAvecReact);`

`// 4. Les assertions peuvent maintenant vérifier le HTML qui a été`  
 `//    rendu côté serveur par le composant React.`  
 `expect(html).toContain('');`  
 `expect(html).toContain('<span>Compteur React</span>');`  
`});`

_(Source : )_  
Pour des cas plus complexes ou en dehors d'un environnement Vite, il est aussi possible d'ajouter les renderers manuellement via la méthode container.addServerRenderer().

### **Gestion de Projets Complexes avec Vitest Workspaces**

Un projet Astro typique peut contenir à la fois des composants .astro et des composants d'UI (par exemple, des .tsx pour React). Ces deux types de composants nécessitent des environnements de test différents :

- **Tests de composants .astro** : Ils utilisent l'API Container et n'ont pas forcément besoin d'un DOM pour le rendu initial (bien que nous l'utilisions pour les assertions avec Testing Library).
- **Tests de composants React purs** : Ils sont mieux testés avec @testing-library/react, qui nécessite un environnement jsdom et une configuration spécifique pour React.

Tenter de faire cohabiter ces deux configurations dans un seul vitest.config.ts peut s'avérer complexe et source d'erreurs. La solution architecturale à ce problème est la fonctionnalité **Workspaces** (ou "Projects") de Vitest. Elle permet de définir plusieurs configurations de test indépendantes qui peuvent être exécutées ensemble ou séparément.  
Cette approche est la meilleure pratique pour les projets Astro non-triviaux, car elle reflète la philosophie "bring your own framework" d'Astro en offrant une solution de test adaptée à cette hétérogénéité.  
Voici un exemple de structure de configuration avec des workspaces :

1. **vitest.workspace.ts (Point d'entrée principal)** Ce fichier, à la racine du projet, déclare les différents projets de test.  
   `// vitest.workspace.ts`  
   `import { defineWorkspace } from 'vitest/config';`

   `export default defineWorkspace();`  
   _(Source : )_

2. **tests/astro.config.ts (Configuration pour les tests .astro)** Ce fichier est dédié aux tests de composants .astro.  
   `// tests/astro.config.ts`  
   `import { getViteConfig } from 'astro/config';`  
   `import { defineConfig, mergeConfig } from 'vitest/config';`

   `export default mergeConfig(`  
    `getViteConfig({`  
    `test: {`  
    `// Inclure uniquement les tests pour les composants Astro`  
    `include: ['../src/components/**/*.test.ts'],`  
    `// Exclure les tests de composants React`  
    `exclude: ['../src/components/react/**/*.test.tsx'],`  
    `name: 'astro-components',`  
    `},`  
    `}),`  
    `defineConfig({`  
    `// Configuration supplémentaire si nécessaire`  
    `})`  
   `);`  
   _(Source : )_

3. **tests/react.config.ts (Configuration pour les tests .tsx)** Ce fichier configure un environnement optimisé pour React Testing Library.  
   `// tests/react.config.ts`  
   `import { defineConfig } from 'vitest/config';`  
   `import react from '@vitejs/plugin-react';`

   `export default defineConfig({`  
    `plugins: [react()],`  
    `test: {`  
    `// Inclure uniquement les tests pour les composants React`  
    `include: ['../src/components/react/**/*.test.tsx'],`  
    `name: 'react-components',`  
    `environment: 'jsdom',`  
    `globals: true,`  
    `setupFiles: ['./setup.ts'], // Peut être le même setup file`  
    `},`  
   `});`  
   _(Source : )_

Avec cette structure, la commande vitest exécutera les deux suites de tests, chacune avec sa propre configuration, et fournira un rapport unifié.

### **Guide de Dépannage (Troubleshooting)**

Les problèmes les plus courants lors de la mise en place des tests avec Astro et Vitest sont liés à la configuration et aux dépendances, en raison de la chaîne Astro \-\> Vite \-\> Vitest.

- **Problème 1 : Erreur Object literal may only specify known properties, and 'test' does not exist in type 'UserConfig'.**
  - **Cause :** C'est le symptôme classique d'une incompatibilité de version entre la version de Vite utilisée par votre version d'Astro et celle attendue par votre version de Vitest.
  - **Solutions :**
    1. Mettez à jour vitest et toutes les dépendances @vitest/\* vers la dernière version compatible. Parfois, une mise à jour majeure de Vitest est nécessaire pour supporter une nouvelle version majeure de Vite.
    2. Utilisez les overrides (npm/pnpm) ou resolutions (yarn) dans package.json pour forcer une seule et même version de vite à être utilisée par toutes les dépendances de votre projet. C'est une solution de contournement efficace en attendant les mises à jour officielles.
    3. Assurez-vous qu'il n'y a pas de versions dupliquées de Vite dans votre fichier de lock en exécutant npm ls vite ou pnpm why vite. Si c'est le cas, régénérer le lockfile (rm \-rf node_modules package-lock.json && npm install) ou utiliser pnpm dedupe peut résoudre le problème.
- **Problème 2 : Avertissements concernant ssr.optimizeDeps.disabled**
  - **Cause :** La fonction getViteConfig d'Astro peut générer des options de configuration qui sont devenues obsolètes dans les versions plus récentes de Vite.
  - **Solution :** Cet avertissement provient de l'équipe Astro et est généralement inoffensif. Il peut être ignoré en toute sécurité en attendant qu'une future version d'Astro mette à jour getViteConfig.
- **Problème 3 : L'API Container ne semble pas utiliser une configuration surchargée dans getViteConfig (ex: pour i18n)**
  - **Cause :** L'API Container peut être instanciée avec son propre objet de configuration (astroConfig). Si cet objet est fourni, il a la priorité sur la configuration globale chargée par getViteConfig.
  - **Solution :** Si un test spécifique nécessite une configuration Astro particulière (par exemple, pour tester différentes locales i18n), passez cette configuration directement à la méthode create() : AstroContainer.create({ astroConfig: { i18n: {... } } }). Cela garantit que le rendu utilisera cette configuration spécifique.

## **Conclusion et Recommandations**

Ce guide a présenté une méthodologie complète et moderne pour tester des composants Astro avec Vitest, en se concentrant sur le rendu et la validation de leur contenu réel, sans recourir à des mocks.

### **Synthèse de la Méthodologie Robuste**

L'approche recommandée peut être résumée en une série d'étapes et d'outils synergiques :

1. **Configuration de l'Environnement :** Utiliser **Vitest** comme exécuteur de tests, configuré via l'utilitaire **getViteConfig** d'Astro pour assurer la cohérence. Activer l'environnement **jsdom** et utiliser un fichier **setup.ts** pour importer les matchers de @testing-library/jest-dom.
2. **Rendu du Composant :** Employer l'API **experimental_AstroContainer** et sa méthode **renderToString()** pour générer en mémoire le HTML d'un composant .astro, en lui passant dynamiquement des props et des slots.
3. **Assertion Sémantique :** Injecter le HTML résultant dans le document de jsdom et utiliser les requêtes de **@testing-library/dom** (comme getByRole, getByText) pour effectuer des assertions robustes, lisibles et maintenables.

Cette chaîne d'outils constitue une solution de bout en bout qui permet de tester les composants Astro de manière fiable, en alignement direct avec les principes fondamentaux et l'architecture du framework.

### **Meilleures Pratiques et Prochaines Étapes**

Pour tirer le meilleur parti de cette configuration, voici quelques recommandations finales :

- **Tester le comportement, pas l'implémentation :** Adoptez pleinement la philosophie de Testing Library. Privilégiez les requêtes que ferait un utilisateur (getByRole, getByLabelText) plutôt que de vous fier à des sélecteurs CSS ou des data-testid qui couplent vos tests à la structure interne du balisage.
- **Organiser les tests pour la complexité :** Pour les projets qui mélangent des composants .astro avec des îles d'UI (React, Svelte, etc.), adoptez les **Workspaces de Vitest**. Cette structure de configuration maintiendra votre base de tests organisée et évolutive.
- **Pratiquer la veille technologique :** L'écosystème JavaScript, et en particulier celui de Vite et Astro, évolue rapidement. Les problèmes de configuration sont souvent liés à des mises à jour de dépendances. Garder un œil sur les journaux de modifications (changelogs) d'Astro, de Vite et de Vitest vous aidera à anticiper et à résoudre les problèmes rapidement.
- **Intégration Continue (CI/CD) :** Les tests configurés de cette manière s'intègrent de manière transparente dans n'importe quel pipeline de CI/CD. Utilisez la commande vitest run (configurée dans le script npm run test) pour exécuter les tests dans des environnements automatisés et garantir la non-régression de votre code.

En conclusion, bien que la mise en place initiale puisse sembler comporter plusieurs étapes, l'investissement dans une configuration de test aussi robuste est inestimable. Il apporte une confiance accrue dans la qualité du code, réduit considérablement les coûts de maintenance des tests et, au final, permet de livrer des projets Astro plus fiables et plus solides.

#### **Sources des citations**

1\. Astro Testing \- testRigor AI-Based Automated Testing Tool, https://testrigor.com/astro-testing/ 2\. Components \- Astro Docs, https://docs.astro.build/en/basics/astro-components/ 3\. Vitest | Next Generation testing framework, https://vitest.dev/ 4\. Getting Started | Guide \- Vitest, https://vitest.dev/guide/ 5\. Astro Container API (experimental) | Docs, https://docs.astro.build/en/reference/container-reference/ 6\. Container API: render components in isolation · withastro roadmap · Discussion \#462, https://github.com/withastro/roadmap/discussions/462 7\. Astro 4.9, https://astro.build/blog/astro-490/ 8\. Nextjs Testing Guide: Unit and E2E Tests with Vitest & Playwright \- Strapi, https://strapi.io/blog/nextjs-testing-guide-unit-and-e2e-tests-with-vitest-and-playwright 9\. Setup \- Testing Library, https://testing-library.com/docs/svelte-testing-library/setup/ 10\. testing-library/dom-testing-library: Simple and complete DOM testing utilities that encourage good testing practices. \- GitHub, https://github.com/testing-library/dom-testing-library 11\. Using Testing Library jest-dom with Vitest \- Markus Oberlehner, https://markus.oberlehner.net/blog/using-testing-library-jest-dom-with-vitest 12\. Testing \- Astro Docs, https://docs.astro.build/en/guides/testing/ 13\. astro-mol-bio-tools/vitest.config.ts at main · ccozens/astro-mol-bio ..., https://github.com/ccozens/astro-mol-bio-tools/blob/main/vitest.config.ts 14\. Vitest Workspace Configuration \- raphberube.com, https://raphberube.com/technotes/vitest-setup-astro-react/ 15\. How to test Vite projects using Vitest \- YouTube, https://www.youtube.com/watch?v=rBdGDiwVyes 16\. Vitest is broken in Astro v5 · Issue \#12723 · withastro/astro \- GitHub, https://github.com/withastro/astro/issues/12723 17\. \`vitest\` config failing type check on \`vitest@2.1.1\` · Issue \#12053 · withastro/astro \- GitHub, https://github.com/withastro/astro/issues/12053 18\. Astro 5.0.2 with vitest: getViteConfig and renderToSting of container fail \- Stack Overflow, https://stackoverflow.com/questions/79252542/astro-5-0-2-with-vitest-getviteconfig-and-rendertosting-of-container-fail 19\. Cannot run vitest using \`examples/with-vitest\` with astro 5.0.3 · Issue \#12662 \- GitHub, https://github.com/withastro/astro/issues/12662 20\. Astro Container API (experimental), https://www.astrojs.cn/zh-cn/reference/container-reference/ 21\. How to set up unit tests for Astro components \- daily.dev, https://app.daily.dev/posts/how-to-set-up-unit-tests-for-astro-components-g0jthpaj1 22\. Astro Minimal Example \- StackBlitz, https://stackblitz.com/edit/github-39gesu?file=src%2Ftest%2Fexample.test.tsx 23\. Problems with vitest and svelte when using happy-dom or jsdom envs. · Issue \#13072 · withastro/astro \- GitHub, https://github.com/withastro/astro/issues/13072 24\. vitest emits warnings when configured as in astro's vitest example template \#10118 \- GitHub, https://github.com/withastro/astro/issues/10118 25\. Override Astro config using Container API and Vitest · Issue \#11585 \- GitHub, https://github.com/withastro/astro/issues/11585
