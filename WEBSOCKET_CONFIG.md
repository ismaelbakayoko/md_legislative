# Configuration WebSocket Optimale pour React

## 📚 Guide Complet de Configuration

### Architecture Mise en Place

```
src/
├── config/
│   └── index.js          # Configuration centralisée
├── hooks/
│   └── useSocket.js      # Hook WebSocket amélioré
├── services/
│   └── api.js            # API HTTP (utilise config)
└── pages/
    └── *.jsx             # Composants utilisant useSocket
```

---

## 1. Configuration Centralisée (`config/index.js`)

✅ **Avantages:**
- Un seul endroit pour gérer toutes les URLs
- Support des variables d'environnement
- Facilite le déploiement multi-environnement
- Options Socket.IO configurables

### Utilisation des Variables d'Environnement

Créez un fichier `.env` à la racine du projet:

```env
# .env.development
VITE_API_URL=https://localhost:3000

# .env.production  
VITE_API_URL=https://votre-api-production.com
```

---

## 2. Hook useSocket Amélioré

### Nouvelles Fonctionnalités

✨ **Gestion d'état:**
- `isConnected` - État de connexion en temps réel
- `error` - Messages d'erreur détaillés
- `socket` - Instance Socket.IO

✨ **Reconnexion automatique:**
- 5 tentatives avec délai progressif (1s → 5s)
- Reconnexion manuelle si serveur se déconnecte
- Logs détaillés de chaque tentative

✨ **Nettoyage optimal:**
- Suppression de tous les écouteurs d'événements
- Pas de fuite mémoire
- Déconnexion propre

---

## 3. Utilisation dans les Composants

### Exemple Simple

```javascript
import useSocket from '../hooks/useSocket';

function MonComposant() {
    const { socket, isConnected, error } = useSocket('mon_event', (data) => {
        console.log('Données reçues:', data);
        // Traiter les données
    });

    return (
        <div>
            <p>État: {isConnected ? '🟢 Connecté' : '🔴 Déconnecté'}</p>
            {error && <p className="error">Erreur: {error}</p>}
        </div>
    );
}
```

### Exemple avec Redux (comme ResultatsDepartement)

```javascript
import { useDispatch } from 'react-redux';
import useSocket from '../hooks/useSocket';

function ResultatsPage() {
    const dispatch = useDispatch();
    
    // Le hook retourne maintenant un objet
    const { socket, isConnected, error } = useSocket('nouvelle_saisie', (data) => {
        console.log('Mise à jour reçue:', data);
        // Rafraîchir les données
        dispatch(fetchResultats());
    });

    // Afficher l'état de connexion
    return (
        <div>
            {!isConnected && (
                <div className="alert alert-warning">
                    Connexion temps réel indisponible
                </div>
            )}
            {/* Votre contenu */}
        </div>
    );
}
```

### Exemple avec Options Personnalisées

```javascript
const { socket, isConnected } = useSocket(
    'mon_event',
    handleData,
    {
        reconnectionAttempts: 10, // Plus de tentatives
        reconnectionDelay: 2000,  // Délai plus long
        auth: {
            token: localStorage.getItem('token') // Authentification
        }
    }
);
```

---

## 4. Bonnes Pratiques

### ✅ À FAIRE

1. **Utiliser le statut de connexion dans l'UI**
```javascript
{!isConnected && (
    <div className="offline-banner">
        Mode hors ligne - Reconnexion en cours...
    </div>
)}
```

2. **Gérer les erreurs**
```javascript
{error && (
    <div className="error-banner">
        ⚠️ {error}
    </div>
)}
```

3. **Utiliser useCallback pour les handlers**
```javascript
const handleUpdate = useCallback((data) => {
    // Traitement
}, [/* dépendances */]);

useSocket('event', handleUpdate);
```

4. **Émettre des événements**
```javascript
const { socket } = useSocket('event', handler);

const envoyerMessage = () => {
    if (socket && socket.connected) {
        socket.emit('mon_message', { data: 'test' });
    }
};
```

### ❌ À ÉVITER

1. **Ne pas créer de nouvelle fonction callback à chaque render**
```javascript
// ❌ MAUVAIS - Recréé à chaque render
useSocket('event', (data) => console.log(data));

// ✅ BON - Utiliser useCallback
const handler = useCallback((data) => console.log(data), []);
useSocket('event', handler);
```

2. **Ne pas utiliser directement dans les boucles**
```javascript
// ❌ MAUVAIS
items.map(item => {
    useSocket(`event_${item.id}`, handler); // Hooks dans une boucle!
});
```

3. **Ne pas oublier de vérifier la connexion avant d'émettre**
```javascript
// ❌ MAUVAIS
socket.emit('event', data);

// ✅ BON
if (socket?.connected) {
    socket.emit('event', data);
}
```

---

## 5. Débogage

### Logs Console

Le hook produit des logs détaillés:
- `[WebSocket] Connexion à:` - Démarrage
- `[WebSocket] ✅ Connecté` - Connexion réussie
- `[WebSocket] ❌ Déconnecté` - Perte de connexion
- `[WebSocket] 🔄 Tentative de reconnexion` - Reconnexion en cours
- `[WebSocket] 📨 Événement reçu` - Message reçu
- `[WebSocket] 🧹 Nettoyage` - Composant démonté

### Tester la Reconnexion

1. Coupez le serveur
2. Observez les tentatives de reconnexion dans la console
3. Redémarrez le serveur
4. La connexion devrait se rétablir automatiquement

### Problèmes Courants

**Problème:** "CORS policy: No 'Access-Control-Allow-Origin'"
**Solution:** Configurer CORS sur le serveur Socket.IO:
```javascript
// Backend
io.on('connection', (socket) => {
    socket.setMaxListeners(20); // Si beaucoup d'écouteurs
});
```

**Problème:** Multiples connexions créées
**Solution:** Le hook se déconnecte automatiquement au démontage. Vérifiez que vous n'utilisez pas le hook plusieurs fois inutilement.

**Problème:** Callback n'est pas appelé
**Solution:** Vérifiez que le nom de l'événement correspond exactement à celui émis par le serveur.

---

## 6. Migration Depuis l'Ancien Code

### Avant:
```javascript
const socket = useSocket('event', handler);
// socket peut être null
```

### Après:
```javascript
const { socket, isConnected, error } = useSocket('event', handler);
// Accès à l'état de connexion et aux erreurs
```

### Composants à Mettre à Jour

Cherchez tous les usages de `useSocket` et mettez-les à jour:

```bash
# Rechercher dans le projet
grep -r "useSocket" src/
```

---

## 7. Configuration Serveur (Côté Backend)

Assurez-vous que votre serveur Socket.IO est configuré correctement:

```javascript
const io = require('socket.io')(server, {
    cors: {
        origin: [
            'http://localhost:5173',  // Dev
            'https://votre-app.com'    // Prod
        ],
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
});

io.on('connection', (socket) => {
    console.log('Client connecté:', socket.id);
    
    socket.on('disconnect', (reason) => {
        console.log('Client déconnecté:', reason);
    });
    
    // Vos événements personnalisés
    socket.on('mon_event', (data) => {
        // Traiter et émettre
        io.emit('nouvelle_saisie', data);
    });
});
```

---

## ✅ Checklist de Configuration Complète

- [ ] Fichier `config/index.js` créé
- [ ] Variables d'environnement configurées (`.env`)
- [ ] Hook `useSocket.js` mis à jour
- [ ] `api.js` utilise la config centralisée
- [ ] Composants mis à jour pour utiliser le nouveau format
- [ ] Indicateurs d'état de connexion dans l'UI
- [ ] Gestion des erreurs affichée
- [ ] Tests de reconnexion effectués
- [ ] CORS configuré sur le serveur
- [ ] Logs de débogage vérifiés

---

## 🎯 Résultat Final

Vous avez maintenant:
- ✅ Configuration centralisée et maintenable
- ✅ Reconnexion automatique robuste
- ✅ Gestion d'état et d'erreurs
- ✅ Logs détaillés pour le débogage
- ✅ Support multi-environnement
- ✅ Nettoyage optimal sans fuites mémoire
- ✅ Code réutilisable et testable
