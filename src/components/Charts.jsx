import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

// Palette de couleurs vibrantes et diversifiées pour les partis politiques
const PARTY_COLORS = {
    'RN': '#0d378a',      // Bleu foncé
    'ENS': '#f58b3f',     // Orange
    'NFP': '#e4032d',     // Rouge
    'LR': '#0058a2',      // Bleu
    'DIV': '#6b7280',     // Gris
    'UDI': '#84cc16',     // Vert lime
    'DVD': '#3b82f6',     // Bleu ciel
    'DVG': '#ec4899',     // Rose
    'REC': '#1e293b',     // Ardoise foncé
    'ECO': '#10b981',     // Vert émeraude
    'LREM': '#f59e0b',    // Ambre
    'PS': '#ef4444',      // Rouge vif
    'EELV': '#22c55e',    // Vert
    'PCF': '#dc2626',     // Rouge profond
    'FI': '#e11d48',      // Rose rouge
    'MODEM': '#f97316',   // Orange vif
    'PRG': '#fb923c',     // Orange clair
    'UMP': '#2563eb',     // Bleu royal
    'FN': '#1e40af',      // Bleu indigo
    'DLF': '#7c3aed',     // Violet
    'LFI': '#c026d3',     // Fuchsia
    'REG': '#14b8a6',     // Sarcelle
    'AUT': '#8b5cf6',     // Violet clair
    'EXG': '#be123c',     // Rose profond
    'EXD': '#0369a1',     // Cyan foncé
    'DSV': '#059669',     // Vert foncé
};

// Palette de couleurs de secours vibrantes pour les partis non listés
const FALLBACK_COLORS = [
    '#3b82f6', // Bleu
    '#ef4444', // Rouge
    '#10b981', // Vert
    '#f59e0b', // Orange
    '#8b5cf6', // Violet
    '#ec4899', // Rose
    '#14b8a6', // Sarcelle
    '#f97316', // Orange foncé
    '#6366f1', // Indigo
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#f43f5e', // Rose rouge
    '#0ea5e9', // Bleu ciel
    '#a855f7', // Violet clair
    '#22c55e', // Vert vif
    '#fb923c', // Orange pêche
    '#c026d3', // Fuchsia
    '#0891b2', // Cyan foncé
    '#65a30d', // Lime foncé
    '#e11d48', // Rouge cramoisi
];

// Fonction pour générer une couleur unique basée sur l'index
let colorIndexCounter = 0;
const usedColors = new Map();

const getColor = (partyCode, index = 0) => {
    // Si le parti a une couleur définie, l'utiliser
    if (PARTY_COLORS[partyCode]) {
        return PARTY_COLORS[partyCode];
    }

    // Sinon, assigner une couleur de la palette de secours
    if (!usedColors.has(partyCode)) {
        const colorIndex = colorIndexCounter % FALLBACK_COLORS.length;
        usedColors.set(partyCode, FALLBACK_COLORS[colorIndex]);
        colorIndexCounter++;
    }

    return usedColors.get(partyCode);
};

// Fonction pour générer des couleurs avec gradient pour plus de profondeur
const getColorWithAlpha = (partyCode, alpha = 1, index = 0) => {
    const color = getColor(partyCode, index);
    // Convertir hex en rgba pour l'alpha
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const ResultBarChart = ({ candidates }) => {
    const data = {
        labels: candidates.map(c => c.nom),
        datasets: [
            {
                label: 'Voix',
                data: candidates.map(c => c.voix),
                backgroundColor: candidates.map((c, idx) => {
                    const color = getColor(c.parti, idx);
                    return color;
                }),
                borderColor: candidates.map((c, idx) => {
                    const color = getColor(c.parti, idx);
                    return color;
                }),
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
                hoverBackgroundColor: candidates.map((c, idx) => getColorWithAlpha(c.parti, 0.8, idx)),
                hoverBorderColor: candidates.map((c, idx) => getColor(c.parti, idx)),
                hoverBorderWidth: 3,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: 'bold',
                },
                bodyFont: {
                    size: 13,
                },
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: function (context) {
                        const candidate = candidates[context.dataIndex];
                        const voix = context.parsed.y.toLocaleString();
                        const pourcentage = candidate.pourcentage || '0.00';
                        return [
                            `Voix: ${voix}`,
                            `Pourcentage: ${pourcentage}%`,
                            `Parti: ${candidate.parti}`
                        ];
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        size: 11,
                        weight: '600',
                    },
                    color: '#6b7280',
                    callback: function (value) {
                        return value.toLocaleString();
                    }
                },
            },
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        size: 11,
                        weight: '600',
                    },
                    color: '#374151',
                    maxRotation: 45,
                    minRotation: 45,
                },
            },
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart',
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
    };

    return <Bar options={options} data={data} />;
};


export const ResultPieChart = ({ candidates }) => {
    const data = {
        labels: candidates.map(c => `${c.nom_prenoms || c.nom} (${c.parti})`),
        datasets: [
            {
                data: candidates.map(c => c.voix),
                backgroundColor: candidates.map((c, idx) => getColor(c.parti, idx)),
                borderColor: candidates.map(() => '#ffffff'),
                borderWidth: 3,
                hoverBackgroundColor: candidates.map((c, idx) => getColorWithAlpha(c.parti, 0.9, idx)),
                hoverBorderColor: candidates.map(() => '#ffffff'),
                hoverBorderWidth: 4,
                hoverOffset: 15,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.2,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    font: {
                        size: 11,
                        weight: '600',
                    },
                    color: '#374151',
                    usePointStyle: true,
                    pointStyle: 'circle',
                    generateLabels: function (chart) {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            return data.labels.map((label, i) => {
                                const meta = chart.getDatasetMeta(0);
                                const style = meta.controller.getStyle(i);
                                return {
                                    text: label,
                                    fillStyle: style.backgroundColor,
                                    strokeStyle: style.borderColor,
                                    lineWidth: style.borderWidth,
                                    hidden: isNaN(data.datasets[0].data[i]) || meta.data[i].hidden,
                                    index: i
                                };
                            });
                        }
                        return [];
                    }
                }
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                padding: 14,
                titleFont: {
                    size: 14,
                    weight: 'bold',
                },
                bodyFont: {
                    size: 13,
                },
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: function (context) {
                        const candidate = candidates[context.dataIndex];
                        const voix = context.parsed.toLocaleString();
                        const pourcentage = candidate.pourcentage || '0.00';
                        const total = candidates.reduce((sum, c) => sum + c.voix, 0);
                        const partTotal = ((context.parsed / total) * 100).toFixed(2);

                        return [
                            `Voix: ${voix}`,
                            `Pourcentage: ${pourcentage}%`,
                            `Part du total: ${partTotal}%`
                        ];
                    }
                }
            }
        },
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1200,
            easing: 'easeInOutQuart',
        },
        interaction: {
            mode: 'nearest',
            intersect: true,
        },
    };

    return <Pie data={data} options={options} />;
};

// Version personnalisée avec légende à droite
export const ResultPieChartWithCustomLegend = ({ candidates }) => {
    const data = {
        labels: candidates.map(c => `${c.nom_prenoms || c.nom}`),
        datasets: [
            {
                data: candidates.map(c => c.voix),
                backgroundColor: candidates.map((c, idx) => getColor(c.parti, idx)),
                borderColor: candidates.map(() => '#ffffff'),
                borderWidth: 3,
                hoverBackgroundColor: candidates.map((c, idx) => getColorWithAlpha(c.parti, 0.9, idx)),
                hoverBorderColor: candidates.map(() => '#ffffff'),
                hoverBorderWidth: 4,
                hoverOffset: 15,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        plugins: {
            legend: {
                display: false, // On cache la légende par défaut
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                padding: 14,
                titleFont: {
                    size: 14,
                    weight: 'bold',
                },
                bodyFont: {
                    size: 13,
                },
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: function (context) {
                        const candidate = candidates[context.dataIndex];
                        const voix = context.parsed.toLocaleString();
                        const pourcentage = candidate.pourcentage || '0.00';
                        const total = candidates.reduce((sum, c) => sum + c.voix, 0);
                        const partTotal = ((context.parsed / total) * 100).toFixed(2);

                        return [
                            `Voix: ${voix}`,
                            `Pourcentage: ${pourcentage}%`,
                            `Part du total: ${partTotal}%`
                        ];
                    }
                }
            }
        },
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1200,
            easing: 'easeInOutQuart',
        },
        interaction: {
            mode: 'nearest',
            intersect: true,
        },
    };

    return (
        <div className="flex flex-col lg:flex-row gap-2 items-center">
            {/* Diagramme circulaire à gauche */}
            <div className="w-full lg:w-5/12 flex justify-center">
                <div className="w-full max-w-xs">
                    <Pie data={data} options={options} />
                </div>
            </div>

            {/* Légende personnalisée à droite */}
            <div className="w-full lg:w-6/12">
                <div className="space-y-2">
                    {candidates.map((candidate, index) => {
                        const color = getColor(candidate.parti, index);
                        const totalVoix = candidates.reduce((sum, c) => sum + c.voix, 0);
                        const percentage = totalVoix > 0 ? ((candidate.voix / totalVoix) * 100).toFixed(2) : '0.00';

                        return (
                            <div
                                key={index}
                                className="group flex items-center gap-3 p-2.5 rounded-lg bg-white/50 hover:bg-white border border-gray-200/50 hover:border-gray-300 hover:shadow-md transition-all duration-300"
                            >
                                {/* Indicateur de couleur */}
                                <div
                                    className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white shadow-sm group-hover:scale-125 transition-transform duration-300"
                                    style={{ backgroundColor: color }}
                                ></div>

                                {/* Informations du candidat */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 w-full">
                                        {/* Nom du candidat : toujours visible en entier */}
                                        <p className="font-bold text-gray-900 text-lg whitespace-nowrap">
                                            {candidate.nom_prenoms || candidate.nom}
                                        </p>

                                        {/* Parti : prend l’espace restant et tronque */}
                                        <span className="ml-auto max-w-[45%] text-[14px] font-semibold text-gray-600 
                   bg-gray-100 px-2 py-0.5 rounded truncate text-right">
                                            {candidate.parti}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[18px] font-bold text-gray-600 whitespace-nowrap">
                                            {candidate.voix.toLocaleString()} voix
                                        </span>

                                        {/* CONTENEUR FLEX */}
                                        <div className="flex items-center gap-1 flex-1 min-w-0">

                                            {/* BARRE */}
                                            <div className="flex-1 min-w-0 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                                                    style={{
                                                        width: `${percentage}%`,
                                                        backgroundColor: color,
                                                    }}
                                                />
                                            </div>

                                            <span
                                                className="text-[18px] font-extrabold whitespace-nowrap"
                                                style={{ color: color }}
                                            >
                                                {percentage}%
                                            </span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

