import React, { useState } from 'react';
import { Link } from 'react-router-dom';
const CandidatesList = ({ partis }) => {
    console.log("PARTIS ===>", partis);
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!partis || partis.length === 0) return null;

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % partis.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + partis.length) % partis.length);
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    const currentParti = partis[currentIndex];

    return (
        <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Candidats en Lice</h3>

            <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                {/* Navigation Buttons */}
                {partis.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 rounded-full p-2 shadow-md border border-gray-300 transition-all"
                            aria-label="Parti précédent"
                        >
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 rounded-full p-2 shadow-md border border-gray-300 transition-all"
                            aria-label="Parti suivant"
                        >
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}

                {/* Carousel Content */}
                <div className="px-8">
                    <div className="flex items-center justify-center mb-6 pb-4 border-b border-gray-200">
                        {currentParti.logo_url ? (
                            <img src={currentParti.logo_url} alt={currentParti.sigle} className="h-16 w-16 mr-4 object-contain" />
                        ) : (
                            <div className="h-16 w-16 mr-4 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                                {currentParti.sigle?.substring(0, 2)}
                            </div>
                        )}
                        <div>
                            <h4 className="text-2xl font-bold text-gray-900">{currentParti.nom_parti}</h4>
                            <span className="text-sm text-brand-600 font-semibold">{currentParti.sigle}</span>
                        </div>
                    </div>

                    {/* Candidates Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentParti.candidats.map((candidat) => (
                            <Link
                                to={`/candidat/${candidat.id_candidat}`}
                                key={candidat.id_candidat}
                                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <div className="flex-shrink-0">
                                    {candidat.photo_candidat ? (
                                        <img className="h-16 w-16 rounded-full object-cover border-2 border-brand-200 shadow-sm" src={candidat.photo_candidat} alt={candidat.nom_prenoms} />
                                    ) : (
                                        <span className="inline-block h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-gray-300">
                                            <svg className="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        </span>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-base font-semibold text-gray-900">
                                        {candidat.nom_prenoms}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {candidat.profession}
                                    </p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${candidat.statut_cand === 'Titulaire'
                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                                        }`}>
                                        {candidat.statut_cand}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Indicators */}
                {partis.length > 1 && (
                    <div className="flex justify-center mt-6 space-x-2">
                        {partis.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`h-2 rounded-full transition-all ${index === currentIndex
                                    ? 'w-8 bg-brand-600'
                                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                                    }`}
                                aria-label={`Aller au parti ${index + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* Counter */}
                {partis.length > 1 && (
                    <div className="text-center mt-3 text-sm text-gray-500">
                        Parti {currentIndex + 1} sur {partis.length}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CandidatesList;
