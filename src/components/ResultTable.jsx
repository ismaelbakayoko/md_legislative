import React from 'react';
import { Link } from 'react-router-dom';

const ResultTable = ({ candidates, totalExprimes }) => {
    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-3 py-2 text-left text-[16px] font-medium text-gray-500 uppercase tracking-wider">
                            Rang
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-[16px] font-medium text-gray-500 uppercase tracking-wider">
                            Candidat
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-[16px] font-medium text-gray-500 uppercase tracking-wider">
                            Parti
                        </th>
                        <th scope="col" className="px-3 py-2 text-right text-[16px] font-medium text-gray-500 uppercase tracking-wider">
                            Voix
                        </th>
                        <th scope="col" className="px-3 py-2 text-right text-[16px] font-medium text-gray-500 uppercase tracking-wider">
                            Pourcentage
                        </th>
                        <th scope="col" className="px-3 py-2 text-center text-[16px] font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {candidates
                        .filter(c => c.id !== 'blancs' && c.id !== 'nuls')
                        .map((candidat, index) => {
                            // Utiliser le pourcentage pré-calculé s'il existe (pour la cohérence avec le diagramme)
                            const percentage = candidat.pourcentage || ((candidat.voix / totalExprimes) * 100).toFixed(2);
                            const isElected = parseFloat(percentage) >= 50;
                            const isLeading = index === 0;
                            const titulaire = candidat.candidats?.find(c => c.statut_cand === 'Titulaire') || candidat.candidats?.[0];
                            const photoUrl = titulaire?.photo_candidat || candidat.logo;

                            return (
                                <tr key={candidat.id || index} className="group hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-2 whitespace-nowrap text-mx text-gray-500 text-center font-mono">
                                        {index + 1}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8">
                                                {photoUrl ? (
                                                    <img className="h-8 w-8 rounded-full object-cover border border-gray-200" src={photoUrl} alt="" />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-mx border border-brand-200">
                                                        {candidat.parti?.substring(0, 2)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-3">
                                                <Link
                                                    to={`/candidat/${candidat.id}`}
                                                    state={{ candidat }}
                                                    className="text-xm font-medium text-gray-900 group-hover:text-brand-600 group-hover:underline"
                                                >
                                                    {candidat.nom}
                                                </Link>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xm font-medium bg-gray-100 text-gray-800">
                                            {candidat.parti}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-right text-xm text-gray-900 font-mono font-bold">
                                        {candidat.voix.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-right text-xm text-brand-600 font-mono font-bold">
                                        {percentage}%
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center text-xm">
                                        {isElected ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xm font-medium bg-green-100 text-green-800 border border-green-200">
                                                ÉLU
                                            </span>
                                        ) : isLeading ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                                EN TÊTE
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                </tbody>
            </table>
        </div>
    );
};

export default ResultTable;
