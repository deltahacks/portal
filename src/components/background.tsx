import React from 'react';

const Background = () => {
    return (
        <div className="animate-pulse absolute top-0 left-0 h-full w-full bg-cover -z-10" style={{backgroundImage: `url(./background.svg)`}}></div>
    );
};

export default Background;