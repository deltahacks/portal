import React from 'react';

const Background = () => {
    return (
        <div className="bg-[#1F1F1F] absolute top-0 h-screen w-screen -z-10">
            <div className="animate-pulse absolute top-0 right-0 h-full w-full bg-cover -z-10" style={{backgroundImage: `url(./background.svg)`}}></div>
        </div>
    );
};

export default Background;