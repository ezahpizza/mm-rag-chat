import React from 'react';
import { ErrorDisplayProps } from '@/components/compare/types';
import { FiInfo } from 'react-icons/fi';
import { MdCompare } from "react-icons/md";

export const PageHeader = () => (
  <div className="m-8 mt-24">
    <h1 className="text-3xl font-bold text-pearl mb-2">
      Document Comparison
    </h1>
    <p className="text-ocean">
      Upload two legal documents to automatically identify differences, risks, and key variations in clauses.
    </p>
  </div>
);

export const ErrorDisplay = ({ error }: ErrorDisplayProps) => (
  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
    <div className="flex">
      <div className="text-red-800">
        <strong>Error:</strong> {error}
      </div>
    </div>
  </div>
);

export const HelpSection = () => (
  <div className="bg-gradient-to-br from-obsidian to-persian text-pearl p-6 rounded-lg w-full shadow-xl cursor-default relative overflow-hidden  mt-8">
              <FiInfo className="text-pearl/10 rotate-12 text-[250px] absolute z-0 -top-24 -left-24" />
              <div className="relative z-10">
                <div className="bg-pearl w-16 h-16 mb-2 rounded-full text-3xl text-indigo-600 grid place-items-center mx-auto">
                  <MdCompare />
                </div>
                <h3 className="text-lg font-medium text-pearl mb-3">
                  How to Use Document Comparison
                  </h3>
                  <ul className="text-skye space-y-2">
                      <li className="flex items-start">
                          <span className="mr-2">1.</span>
                          Upload two PDF documents using the upload areas above.
                      </li>
                      <li className="flex items-start">
                          <span className="mr-2">2.</span>
                          Preview your documents to ensure they uploaded correctly.
                      </li>
                      <li className="flex items-start">
                          <span className="mr-2">3.</span>
                          Click &ldquo;Compare Documents&rdquo; to automatically parse, index, and analyze differences.
                      </li>
                      <li className="flex items-start">
                          <span className="mr-2">4.</span>
                          Review the results with risk assessments and use filters to focus on specific areas.
                      </li>
                  </ul>

              </div>
            </div>
);