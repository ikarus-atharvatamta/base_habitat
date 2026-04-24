import React from 'react';
import ModelViewer from './ModelViewer';

const EditorPage = () => {
  return (
    <div className="flex flex-col h-screen w-full bg-warm-neutral-light font-sans text-charcoal overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <div className="relative w-full bg-warm-neutral-light flex flex-col overflow-hidden">
          {/* Logo (Desktop Only) */}
          <div className="absolute top-5 left-5 lg:left-10 z-[35] hidden md:block">
            <img src={`${import.meta.env.BASE_URL}logo/logo-image.png`} alt="" className='w-25 h-fit' />
          </div>

          {/* 3D Viewer */}
          <ModelViewer />
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
