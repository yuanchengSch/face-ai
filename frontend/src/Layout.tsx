import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div>
            {/* This file is actually unused since I put Layout in main.tsx for simplicity, 
           but keeping it for structure if needed later.*/}
            <Outlet />
        </div>
    );
};

export default Layout;
