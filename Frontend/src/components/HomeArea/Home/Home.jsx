import React, { useEffect, useState } from "react";
import GenericFolder from "../GenericFolder/GenericFolder";

function Home() {
    const [currentFolder, setCurrentFolder] = useState([]);

    useEffect(() => {
        setCurrentFolder(JSON.parse(localStorage.getItem("currentFolder")));
    }, []);

    return (
        <div className="Home">
            <div className="FoldersArea">
                <GenericFolder
                    currentFolder={currentFolder}
                />
            </div>
        </div>
    );
}

export default Home;
