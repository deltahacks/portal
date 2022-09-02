import React from 'react';

const NavBar = () => {
    return (
        <div className="flex flex-row justify-between mt-8 mx-10 items-center">

            <div className="flex flex-row justify-between items-center">
                <a className="mr-5" href="#">
                    <img className="inline-block w-20 h-16" src="logo.svg"/>
                </a>

                <div className="inline-block font-main">
                    <h1 className="text-2xl">
                        <strong>Delta</strong>Hacks <strong>IX</strong>
                    </h1>
                    <p className="text-xs">
                        January 13-15 | McMaster University
                    </p>
                </div>

                <div className="font-sub ml-5">
                    <a className="text-base font-bold mx-2" href="#">Dashboard</a>

                    <a className="text-base font-bold mx-2" href="#">Calendar</a>
                </div>
            </div>
            
            <div>
                <button className="mx-2">
                    <img className="inline-block w-5 h-5" src="dark-toggle.svg"/>
                </button>

                <a className="font-sub text-sm mx-2">
                    Logged in as <strong className=" font-bold"> Username</strong>
                </a>

                <button className="bg-[#4F14EE] py-2.5 px-7 rounded font-sub text-sm font-bold mx-2">
                    Sign out
                </button>
            </div>
        </div>
    );
};

export default NavBar;