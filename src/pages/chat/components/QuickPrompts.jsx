import React from 'react';

const QuickPrompt = React.memo(({ icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-start p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 w-full group hover:scale-[1.02] relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative z-10">
      <div className="w-12 h-12 mb-4 text-gray-600 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg p-2.5 group-hover:from-purple-200 group-hover:to-indigo-200 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </button>
));

const QuickPrompts = ({ quickPrompts, onQuickPrompt }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 tracking-tight">
          Hi there, {' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 animate-gradient">
            John
          </span>
        </h1>
        <h2 className="text-4xl font-semibold mb-6">
          What{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 animate-gradient">
            would you like to know
          </span>
          ?
        </h2>
        <p className="text-lg text-gray-600">
          使用下方的常用提示或输入您自己的问题
        </p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {quickPrompts.map((prompt, index) => (
          <QuickPrompt
            key={index}
            {...prompt}
            onClick={() => onQuickPrompt(prompt)}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(QuickPrompts);