'use client';

import React from 'react';

const SoportePage = () => {
  return (
    <div className="bg-gray-850 min-h-screen text-white">
      <main className="px-4 py-6">
        {/* FAQ Section */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">
            Soporte
          </h1>
          <h2 className="text-xl font-semibold text-center mb-6">
            F.A.Q.
          </h2>
          <div className="space-y-4">
            {[
              {
                question: '¿Qué es Lorem Ipsum?',
                answer:
                  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
              },
              {
                question: '¿Por qué usamos Lorem Ipsum?',
                answer:
                  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
              },
              {
                question: '¿De dónde proviene?',
                answer:
                  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
              },
              {
                question: '¿Cómo puedo contactarlos?',
                answer:
                  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
              },
            ].map((faq, index) => (
              <details
                key={index}
                className="border border-gray-600 rounded-md p-4 bg-gray-700"
              >
                <summary className="font-bold cursor-pointer text-gray-100">
                  {faq.question}
                </summary>
                <p className="mt-2 text-gray-300">{faq.answer}</p>
              </details>
            ))}
          </div>
          <div className="text-center mt-6">
            <p className="text-lg">¿Tienes más dudas o problemas?</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500">
              Contáctanos
            </button>
          </div>
        </section>

        {/* Learn More Section */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <img
                src="/images/placeholder.png"
                alt="Learn More"
                className="w-40 h-40 rounded-lg object-cover bg-gray-700"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3 text-gray-100">
                Learn More
              </h2>
              <p className="mb-4 text-gray-300">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
                accumsan, nisi ut suscipit tincidunt, felis libero aliquet nisl,
                ut ultricies risus leo vitae metus.
              </p>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500">
                Ir a Descargar
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SoportePage;