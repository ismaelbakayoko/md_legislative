export const MOCK_DATA = {
    departements: [
        { code: '01', nom: 'Ain' },
        { code: '02', nom: 'Aisne' },
        { code: '06', nom: 'Alpes-Maritimes' },
        { code: '13', nom: 'Bouches-du-Rhône' },
        { code: '33', nom: 'Gironde' },
        { code: '59', nom: 'Nord' },
        { code: '67', nom: 'Bas-Rhin' },
        { code: '69', nom: 'Rhône' },
        { code: '75', nom: 'Paris' },
        { code: '92', nom: 'Hauts-de-Seine' },
    ],
    activeElection: {
        id: 'legis-2024',
        nom: 'Élections Législatives 2024',
        date: '2024-06-30',
        tour: 1,
        participation: 67.5,
        votants: 48500000,
        totalSieges: 577,
        siegesPourvus: 76
    },
    resultatsDepartement: {
        '75': {
            nom: 'Paris',
            inscrits: 1350000,
            votants: 980000,
            exprimes: 965000,
            participation: 72.5,
            blancs: 10000,
            nuls: 5000,
            candidats: [
                { id: 'c1', nom: 'Dupont', prenom: 'Jean', parti: 'ENS', voix: 15400, circonscription: 1 },
                { id: 'c2', nom: 'Martin', prenom: 'Sophie', parti: 'NFP', voix: 18200, circonscription: 1 },
                { id: 'c3', nom: 'Leclerc', prenom: 'Pierre', parti: 'RN', voix: 6500, circonscription: 1 },
                { id: 'c4', nom: 'Bernard', prenom: 'Marie', parti: 'LR', voix: 4200, circonscription: 1 },
                { id: 'c5', nom: 'Petit', prenom: 'Lucas', parti: 'ECO', voix: 2100, circonscription: 1 },
                { id: 'c6', nom: 'Robert', prenom: 'Julie', parti: 'REC', voix: 900, circonscription: 1 },
                { id: 'c7', nom: 'Durand', prenom: 'Thomas', parti: 'DIV', voix: 300, circonscription: 1 },
                { id: 'c8', nom: 'Moreau', prenom: 'Emma', parti: 'ENS', voix: 14800, circonscription: 2 },
                { id: 'c9', nom: 'Laurent', prenom: 'David', parti: 'NFP', voix: 19500, circonscription: 2 },
                { id: 'c10', nom: 'Simon', prenom: 'Céa', parti: 'RN', voix: 5800, circonscription: 2 },
            ]
        }
    },
    candidats: {
        'c2': {
            id: 'c2',
            nom: 'Martin',
            prenom: 'Sophie',
            parti: 'NFP',
            departement: 'Paris (75)',
            circonscription: 1,
            voix: 18200,
            pourcentage: 38.5,
            position: 1,
            totalVotants: 47300,
            bureaux: [
                { nom: 'Bureau 1 - Mairie', voix: 450, pourcentage: 42.1 },
                { nom: 'Bureau 2 - École Jules Ferry', voix: 380, pourcentage: 36.5 },
                { nom: 'Bureau 3 - Gymnase', voix: 520, pourcentage: 39.8 },
                { nom: 'Bureau 4 - Bibliothèque', voix: 410, pourcentage: 37.2 },
            ]
        },
        'c1': {
            id: 'c1',
            nom: 'Dupont',
            prenom: 'Jean',
            parti: 'ENS',
            departement: 'Paris (75)',
            circonscription: 1,
            voix: 15400,
            pourcentage: 32.6,
            position: 2,
            totalVotants: 47300,
            bureaux: [
                { nom: 'Bureau 1 - Mairie', voix: 320, pourcentage: 29.9 },
                { nom: 'Bureau 2 - École Jules Ferry', voix: 410, pourcentage: 39.4 },
                { nom: 'Bureau 3 - Gymnase', voix: 390, pourcentage: 29.8 },
                { nom: 'Bureau 4 - Bibliothèque', voix: 350, pourcentage: 31.8 },
            ]
        }
    }
};

// Helper pour simuler des données si elles n'existent pas pour un ID donné
export const getMockResultatsDepartement = (id) => {
    if (MOCK_DATA.resultatsDepartement[id]) {
        return MOCK_DATA.resultatsDepartement[id];
    }
    // Génération aléatoire pour les autres départements pour la démo
    return {
        nom: `Département ${id}`,
        inscrits: 500000,
        votants: 350000,
        exprimes: 340000,
        participation: 70,
        blancs: 7000,
        nuls: 3000,
        candidats: Array.from({ length: 15 }).map((_, i) => ({
            id: `mock-c-${id}-${i}`,
            nom: ['Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau', 'Laurent'][i % 10],
            prenom: ['Jean', 'Marie', 'Pierre', 'Sophie', 'Lucas', 'Julie', 'Thomas', 'Emma', 'David', 'Léa'][i % 10],
            parti: ['RN', 'ENS', 'NFP', 'LR', 'ECO', 'REC', 'DIV'][i % 7],
            voix: Math.floor(Math.random() * 20000) + 1000,
            circonscription: (i % 3) + 1
        })).sort((a, b) => b.voix - a.voix)
    };
};

export const getMockCandidat = (id) => {
    if (MOCK_DATA.candidats[id]) {
        return MOCK_DATA.candidats[id];
    }
    // Génération aléatoire pour la démo
    return {
        id,
        nom: 'Candidat',
        prenom: 'Test',
        parti: 'DIV',
        departement: 'Département Test',
        circonscription: 1,
        voix: 10000,
        pourcentage: 25.5,
        position: 3,
        totalVotants: 40000,
        bureaux: [
            { nom: 'Bureau 1', voix: 200, pourcentage: 25 },
            { nom: 'Bureau 2', voix: 150, pourcentage: 22 },
            { nom: 'Bureau 3', voix: 300, pourcentage: 28 },
        ]
    };
};
