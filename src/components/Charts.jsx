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

// Configuration des couleurs par parti (exemple simplifié)
const PARTY_COLORS = {
    'RN': '#0d378a',
    'ENS': '#f58b3f',
    'NFP': '#e4032d',
    'LR': '#0058a2',
    'DIV': '#808080',
    'UDI': '#5efc03',
    'DVD': '#adc1de',
    'DVG': '#e096b1',
    'REC': '#141414',
    'ECO': '#368c4e',
};

const getColor = (partyCode) => PARTY_COLORS[partyCode] || '#9ca3af';

export const ResultBarChart = ({ candidates }) => {
    const data = {
        labels: candidates.map(c => c.nom),
        datasets: [
            {
                label: 'Voix',
                data: candidates.map(c => c.voix),
                backgroundColor: candidates.map(c => getColor(c.parti)),
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Répartition des voix',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return <Bar options={options} data={data} />;
};

export const ResultPieChart = ({ candidates }) => {
    const data = {
        labels: candidates.map(c => `${c.nom} (${c.parti})`),
        datasets: [
            {
                data: candidates.map(c => c.voix),
                backgroundColor: candidates.map(c => getColor(c.parti)),
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: 'Pourcentage des voix',
            },
        },
    };

    return <Pie data={data} options={options} />;
};
