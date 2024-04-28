
"use client";

import { useEffect, useState } from "react";
import { Passphrase } from "./Passphrase";

const BodyApp = ({ children }: { children: React.ReactNode }) => {
    const [showModal, setShowModal] = useState(true);
    useEffect(() => {
        document?.getElementById('pass-modal').showModal();
    }, []);
    return (

        <div>
            <dialog id="pass-modal" className="modal">
                <Passphrase ></Passphrase>
            </dialog>
            {children}
        </div>
    );
};

export default BodyApp;
