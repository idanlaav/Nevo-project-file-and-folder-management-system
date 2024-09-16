import React, { useEffect, useState } from "react";
import FolderImage from "../../../assets/folder.jpg";
import PDFIcon from "../../../assets/PDFIcon.jpg";
import PNGIcon from "../../../assets/PNGIcon.jpg";
import DocxIcon from "../../../assets/DocxIcon.jpg";
import ExcelIcon from "../../../assets/ExcelIcon.jpg";
import "./GenericFolder.css";
import FileExplorer from "../FileExplorer/FileExplorer";
import axios from 'axios';


function GenericFolder({ currentFolder }) {
    const [originalFolderSet, setOriginalFolderSet] = useState(null);
    const [activeFolder, setActiveFolder] = useState(null);
    const [path, setPath] = useState([]);
    const [emptyFolder, setEmptyFolder] = useState(null);
    const [renderedFolders, setRenderedFolders] = useState();
    const [parentFolder, setParentFolder] = useState(null);
    const [fileDetails, setFileDetails] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(null);


    useEffect(() => {
        setOriginalFolderSet(JSON.parse(localStorage.getItem("currentFolder")));
    }, [renderedFolders]);

    if (JSON.parse(localStorage.getItem("currentFolder")) === null) {
        localStorage.setItem("currentFolder", JSON.stringify([
            {
                name: "root",
                children: [],
                files: []
            },
        ]))
    }

    const handleClick = (folder) => {

        if (folder.name) {
            if (folder.children.length === 0 && folder.files.length === 0) {
                setEmptyFolder(true);
            }
            setActiveFolder(folder);
            setParentFolder(folder); 
            setPath((prevPath) => [...prevPath, folder.name]);
        }
    };

    const handleReturn = () => {
        setEmptyFolder(false);

        if (path.length > 1) {
            const parentPath = path.slice(0, path.length - 1);
            let parentFolder;

            if (parentPath.length === 1) {
                parentFolder = findFolderByPath(parentPath);
            } else {
                parentFolder = findFolderByPath(parentPath);
            }

            let filesFolder = findFolderByPath(path.slice(0, path.length - 2))
            const index = filesFolder.findIndex((folder) => folder.name === path[path.length - 2]);

            setActiveFolder(parentFolder);
            setParentFolder(filesFolder[index])
            setRenderedFolders(parentFolder);

            setPath(parentPath);
        } else {
            setActiveFolder(null);
            setParentFolder(null)
            setPath([]);
        }
    };

    const handleAddChildFolder = () => {
        const childName = prompt("Please enter up to 15 letters, letters beyond that will be deleted.\n\nEnter the name of the new child folder:");

        const updatedFolders = JSON.parse(JSON.stringify(originalFolderSet)); // Create a deep copy of originalFolderSet

        if (childName) {
            const trimmedName = childName.slice(0, 15);

            if (trimmedName === "root") {
                alert("This name cannot be selected for subfolders.")
                return
            }

            // Check if a child folder with the same name already exists
            const isDuplicateName = parentFolder.children && parentFolder.children.some((folder) => folder.name === trimmedName);

            let isDuplicateNameAnotherCheck;
            if (activeFolder.name !== "root") {
                isDuplicateNameAnotherCheck = activeFolder && activeFolder.children?.some((folder) => folder.name === trimmedName);
            }
            if (isDuplicateNameAnotherCheck === undefined && activeFolder.name !== "root") {
                isDuplicateNameAnotherCheck = activeFolder && activeFolder.some((folder) => folder.name === trimmedName);
            }

            if (isDuplicateName) {
                alert("A folder with the same name already exists.");
                return; // Exit the function if a duplicate name is found

            } if (isDuplicateNameAnotherCheck) {
                alert("A folder with the same name already exists.");
                return; // Exit the function if a duplicate name is found
            }

            const newChild = {
                name: trimmedName,
                isOpen: false,
                children: [],
                files: []
            };

            if (activeFolder.children) {
                activeFolder.children.push(newChild);
                setOriginalFolderSet(updatedFolders);
            }

            let currentFolder = updatedFolders[0];

            for (let i = 1; i < path.length; i++) {
                const folderName = path[i];
                const foundFolder = currentFolder.children.find(
                    (folder) => folder.name === folderName
                );

                if (foundFolder) {
                    currentFolder = foundFolder;
                } else {
                    // Folder in the path not found, handle error or break the loop
                    break;
                }
            }

            setEmptyFolder(false);

            currentFolder.children.push(newChild);
            setOriginalFolderSet(updatedFolders);
            setActiveFolder(currentFolder.children);
            setRenderedFolders(currentFolder.children);
            localStorage.setItem("currentFolder", JSON.stringify(updatedFolders));
        }
    };

    const handleEditFolderName = (folder) => {
        const newName = prompt("Enter the new name for the folder:", folder.name);

        const isDuplicateName = parentFolder.children && parentFolder.children.some((folder) => folder.name === newName);
        let isDuplicateNameAnotherCheck;
        if (activeFolder.name !== "root") {
            isDuplicateNameAnotherCheck = activeFolder && activeFolder.children?.some((folder) => folder.name === newName);
        }
        if (isDuplicateNameAnotherCheck === undefined && activeFolder.name !== "root") {
            isDuplicateNameAnotherCheck = activeFolder && activeFolder.some((folder) => folder.name === newName);
        }

        if (isDuplicateName) {
            alert("A folder with the same name already exists.");
            return; // Exit the function if a duplicate name is found
        }
        if (isDuplicateNameAnotherCheck) {
            alert("A folder with the same name already exists.");
            return; // Exit the function if a duplicate name is found
        }

        let newChildrenToDisplay;
        if (newName) {
            const trimmedName = newName.slice(0, 15);
            const updatedFolders = JSON.parse(JSON.stringify(originalFolderSet)); // Create a deep copy of originalFolderSet
            const updateFolderNameRecursive = (folders, editedFolder, newFolderName) => {
                for (let i = 0; i < folders.length; i++) {
                    const currentFolder = folders[i];
                    if (currentFolder.name === editedFolder.name) {
                        folders[i].name = newFolderName; // Update the folder name
                        newChildrenToDisplay = folders;
                        localStorage.setItem("currentFolder", JSON.stringify(updatedFolders));
                        break;
                    }

                    if (currentFolder.children && currentFolder.children.length > 0) {
                        updateFolderNameRecursive(currentFolder.children, editedFolder, newFolderName); // Recursively search in child folders
                    }
                }
            };

            updateFolderNameRecursive(updatedFolders, folder, trimmedName);
            setOriginalFolderSet(updatedFolders);
            setRenderedFolders(newChildrenToDisplay)
            setActiveFolder(newChildrenToDisplay)
        }
    };

    const handleDeleteFolder = (folder) => {
        const updatedFolders = JSON.parse(JSON.stringify(originalFolderSet)); // Create a deep copy of originalFolderSet

        const deleteFolderRecursive = (folders, folderToDelete) => {
            for (let i = 0; i < folders.length; i++) {
                const currentFolder = folders[i];
                if (currentFolder.name === folderToDelete.name) {
                    if (folders[i].children.length > 0 || folders[i].files.length > 0) {
                        alert("There is some files or folders inside, to remove that folder please delete all the items inside.")
                    }
                    else {
                        folders.splice(i, 1); // Remove the folder from its parent's children
                        localStorage.setItem("currentFolder", JSON.stringify(updatedFolders))
                    }
                    if (folder.name === "root" && folder.children.length === originalFolderSet[0].children.length) {
                        break;
                    }
                }

                if (currentFolder.children && currentFolder.children.length > 0) {
                    deleteFolderRecursive(currentFolder.children, folderToDelete); // Recursively search in child folders
                }
            }
        };

        deleteFolderRecursive(updatedFolders, folder);
        setOriginalFolderSet(updatedFolders);

        const updatedActiveFolder = findFolderByPath(path, updatedFolders);
        setActiveFolder(updatedActiveFolder);

        let folderToShow = updatedFolders;
        let foundFolder = null;

        for (let i = 0; i < path.length; i++) {
            const folderName = path[i];
            if (Array.isArray(folderToShow)) {
                foundFolder = folderToShow.find((folder) => folder.name === folderName);
            }

            if (foundFolder) {
                folderToShow = foundFolder.children || [];
            } else {
                folderToShow = [];
                break;
            }
        }

        if (foundFolder && activeFolder && activeFolder.children) {
            const index = activeFolder.children.findIndex((folder) => folder.name);
            if (index !== -1) {
                activeFolder.children.splice(index, 1); // Remove the current folder from its parent's children using pop
            }
        }

        let updatedRenderedFolders = foundFolder;

        if (foundFolder && foundFolder.children) {
            updatedRenderedFolders = foundFolder.children;
        }

        if (foundFolder.children.length === 0 && foundFolder.files.length === 0) {
            setEmptyFolder(true)
        }

        setRenderedFolders(foundFolder);
        setParentFolder(foundFolder);
        renderFolders(updatedRenderedFolders)
    };

    const handleAddFile = (file) => {
        let updatedFolders = JSON.parse(JSON.stringify(JSON.parse(localStorage.getItem("currentFolder")))); // Create a deep copy of originalFolderSet

        if (file.name.length > 35) {
            alert("Please shorten the file name before uploading it to up to 35 letters.")
            return
        }
        if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            file.type = "application/docx";
        }
        else if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            file.type = "application/xlsx";
        }
        else if (file.type === "application/msword") {
            file.type = "application/doc";
        }
        else if (file.type === "application/vnd.ms-excel") {
            file.type = "application/xls";
        }

        let currentFolder = findFolderByPath(path.slice(0, path.length - 1))
        const index = currentFolder.findIndex((folder) => folder.name === path[path.length - 1]);

        const activeFolderPath = path;
        const parentFolderPath = activeFolderPath.slice(0, activeFolderPath.length - 1);
        const parentFolder = findFolderByPath(parentFolderPath, updatedFolders);
        const activeChild = parentFolder.find(child => child.name === (activeFolder.name || currentFolder[index].name));

        let isDuplicateName = false;
        for (let i = 0; i < originalFolderSet[0].children.length; i++) {
            const currentFolder = originalFolderSet[0].children;
            for (let j = 0; j < currentFolder[i].files.length; j++) {
                if (currentFolder[i].files.length > 0) {
                    if ((currentFolder[i].files[j]?.name + "." + currentFolder[i].files[j].extension) === (file.name + "." + file.extension)) {
                        isDuplicateName = true
                    }
                }
            }
        }

        if (isDuplicateName === false) {
            for (let j = 0; j < originalFolderSet[0].files.length; j++) {
                const mainFiles = originalFolderSet[0];
                if (mainFiles.files.length > 0) {
                    if ((mainFiles.files[j].name + "." + mainFiles.files[j].extension) === (file.name + "." + file.extension)) {
                        isDuplicateName = true
                    }
                }
            }
        }

        if (isDuplicateName === true) {
            alert("A file with the same name already exists.");
            return; // Exit the function if a duplicate name is found
        }

        // Update the child's files array with the new file name
        activeChild.files.push(file);
        updatedFolders = findFolderByPath(parentFolder[activeFolderPath.length - 1])

        setOriginalFolderSet(updatedFolders);

        if (activeChild?.children.length === 0 && activeChild.files.length > 0) {
            setEmptyFolder(false)
        }
        setParentFolder(activeChild)
        setActiveFolder(activeChild)
        setRenderedFolders(activeChild)

        localStorage.setItem("currentFolder", JSON.stringify(updatedFolders));
    };

    const handleFileDownload = async (file) => {

        const currentFileNameWithExtension = file.name.split(".")[0] + "." + file.extension;
        const url = `http://localhost:3001/api/download/${encodeURIComponent(currentFileNameWithExtension)}`;

        try {
            const response = await fetch(url);
            if (response.ok) {
                const blob = await response.blob();
                const downloadUrl = URL.createObjectURL(blob);

                // Create a temporary link element
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = currentFileNameWithExtension;

                // Programmatically click the link to trigger the download
                link.click();

                // Clean up by revoking the object URL
                URL.revokeObjectURL(downloadUrl);
            } else {
                console.error('Failed to download file:', response.statusText);
            }
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    const fetchFileDetails = (file) => {
        const fullName = file.name + "." + file.extension;
        axios
            .get(`http://localhost:3001/api/download/${encodeURIComponent(fullName)}`, {
                responseType: 'blob'
            })
            .then(async (response) => {
                const headers = response.headers;

                // Access the file properties from the headers
                const mimeType = headers['content-type'];
                const blob = new Blob([response.data], { type: mimeType });
                const fileObj = new File([blob], file.name);

                const mergedFile = {
                    ...fileObj,
                    name: fileObj.name,
                    size: blob.size,
                    type: mimeType,
                    extension: file.extension,
                    lastModifiedDate: file.lastModifiedDate,
                    createdAt: file.createdAt
                };

                // Update the file details state with the fetched details
                setFileDetails(mergedFile);

                // Open the pop-up or modal to display file details
                setIsPopupOpen(true);
            })
            .catch(error => {
                console.error('Error fetching file details:', error);
            });
    };

    // Fetch file details and open the pop-up
    const openFileDetailsPopup = (fileDetailsDisplay) => {
        fetchFileDetails(fileDetailsDisplay);
    };

    // Close the pop-up or modal
    const closeFileDetailsPopup = () => {
        setIsPopupOpen(false);
    };

    const handleEditFileName = async (parentFolder, file) => {
        const newName = prompt("Please enter up to 35 letters, letters beyond that will be deleted.\n\nEnter the new name for the file:", file.name);
        let newParentToDisplay;

        if (!newName) {
            return
        }
        if (newName.length > 35) {
            alert(
                "Please shorten the file name before uploading it to up to 35 letters."
            );
            return;
        }

        const isDuplicateName = parentFolder.files && parentFolder.files.some((existFile) => existFile.name === newName);

        if (isDuplicateName) {
            alert("A file with the same name already exists.");
            return;
        }

        if (newName) {
            const trimmedName = newName.slice(0, 35);
            const updatedFolders = JSON.parse(JSON.stringify(originalFolderSet));
            let numberOfFolder;

            const updateFileNameRecursive = async (files, editedFile, newFileName) => {
                for (let i = 0; i < files.length; i++) {
                    const parentFolder = files[i];
                    let stop = false;
                    for (let j = 0; j < parentFolder.files.length; j++) {
                        if (parentFolder.files.length > 0) {
                            if ((parentFolder?.files[j]?.name + "." + parentFolder?.files[j].extension) === (editedFile.name + "." + editedFile.extension)) {
                                const currentTime = new Date();
                                const year = currentTime.getFullYear();
                                const month = currentTime.getMonth() + 1; // Note: month starts from 0
                                const day = currentTime.getDate();
                                const hours = currentTime.getHours();
                                const minutes = currentTime.getMinutes();
                                const seconds = currentTime.getSeconds();

                                let formattedDate;
                                if (seconds < 10) {
                                    formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:0${seconds}`;
                                }
                                else {
                                    formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                                }

                                files[i].files[j].lastModifiedDate = formattedDate;
                                files[i].files[j].name = newFileName;
                                newParentToDisplay = files;
                                numberOfFolder = i;
                                stop = true;
                                localStorage.setItem(
                                    "currentFolder",
                                    JSON.stringify(updatedFolders)
                                );
                                break;
                            }
                        }
                    }
                    if (stop === true) {
                        break;
                    }
                    if (parentFolder.children && parentFolder.children.length > 0) {
                        await updateFileNameRecursive(parentFolder.children, editedFile, newFileName);
                    }
                }
            };

            await updateFileNameRecursive(updatedFolders, file, trimmedName);

            // Construct the URL with the new file name
            const currentFileNameWithExtension = file.name.split(".")[0] + "." + file.extension;
            const trimmedNameWithExtension = trimmedName + "." + file.extension;
            const url = `http://localhost:3001/api/update/${encodeURIComponent(currentFileNameWithExtension)}`;

            try {
                await fetch(url, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ newFileName: trimmedNameWithExtension }),
                });
            } catch (error) {
                console.error("Error updating file name:", error);
            }

            setOriginalFolderSet(updatedFolders);
            setRenderedFolders(newParentToDisplay[numberOfFolder]);
            setActiveFolder(newParentToDisplay[numberOfFolder]);
            setParentFolder(newParentToDisplay[numberOfFolder]);
        }
    };

    const handleDeleteFile = async (parentFolder, file) => {
        const updatedFolders = JSON.parse(JSON.stringify(originalFolderSet)); // Create a deep copy of originalFolderSet
        const deleteFileRecursive = (folders) => {
            for (let i = 0; i < folders.length; i++) {
                const currentFolder = folders[i];
                let stop;
                for (let j = 0; j < currentFolder.files.length; j++) {
                    if (currentFolder.files[j].name === file.name) {
                        stop = true;
                        currentFolder.files.splice(j, 1);
                        parentFolder.files.splice(j, 1);
                        localStorage.setItem("currentFolder", JSON.stringify(updatedFolders))
                        if (parentFolder.children.length === 0 && parentFolder.files.length === 0) {
                            setEmptyFolder(true)
                        }
                        break
                    }
                }
                if (stop === true) {
                    break
                }
                if (parentFolder.name === "root" && parentFolder.children.length === originalFolderSet[0].children.length) {
                    break;
                }
                if (currentFolder.children && currentFolder.children.length > 0) {
                    deleteFileRecursive(currentFolder.children, file); // Recursively search in child folders
                }
            }
        };

        try {
            // Construct the URL with the file name
            const currentFileNameWithExtension = file.name.split(".")[0] + "." + file.extension;
            const url = `http://localhost:3001/api/delete/${encodeURIComponent(currentFileNameWithExtension)}`;

            // Send a DELETE request to the server
            await fetch(url, {
                method: 'DELETE',
            })
        }
        catch (error) {
            console.error('Error deleting file:', error);
        }

        deleteFileRecursive(updatedFolders, parentFolder);
        setOriginalFolderSet(updatedFolders);
        setActiveFolder(parentFolder);
        setRenderedFolders(updatedFolders)
        setParentFolder(parentFolder)
    };

    const findFolderByPath = (folderPath) => {
        let folderToShow = originalFolderSet;

        for (let i = 0; i < folderPath?.length; i++) {
            const folderName = folderPath[i];
            let foundFolder = null;

            if (Array.isArray(folderToShow)) {
                foundFolder = folderToShow.find((folder) => folder.name === folderName);
            }

            if (foundFolder) {
                folderToShow = foundFolder.children || [];
            } else {
                folderToShow = [];
                break;
            }
        }

        return folderToShow;
    };

    const renderFolders = (folders, activeFolderPath, isParentActive) => {
        if (!Array.isArray(folders)) {
            return null; // Return null or handle this case accordingly
        }

        if (folders === []) {
            setEmptyFolder(true);
        }

        return folders.map((folder) => {
            const folderIsActive = activeFolderPath && activeFolderPath.includes(folder.name);
            const hasChildren = folder.children && folder.children.length > 0;

            return (
                <div key={folder.name}
                    className={`GenericFolder ${folderIsActive ? "" : "hidden"}`}>
                    {/* Render folder name */}
                    <div onDoubleClick={() => handleClick(folder)}>
                        <span className="Box">
                            {folder.name}&nbsp;&nbsp;
                            <img src={FolderImage} alt="logo" />&nbsp;
                            <div className="ButtonsDisplay">
                                {isParentActive && path.length > 0 && (
                                    <button className="DeleteBtn" onClick={() => { handleDeleteFolder(folder) }}>
                                        ✘
                                    </button>
                                )}
                                {isParentActive && path.length > 0 && (
                                    <button className="DeleteBtn" onClick={() => handleEditFolderName(folder)}>
                                        🖊️
                                    </button>
                                )}
                            </div>
                        </span>
                    </div>

                    {/* Render child folders */}
                    {folderIsActive && hasChildren && (
                        <div>
                            <div className="ChildFolders">
                                {renderFolders(folder.children, activeFolderPath, folderIsActive)}
                            </div>
                        </div>
                    )}
                </div>
            );
        });
    };

    if (activeFolder?.length > 0) {
        currentFolder = renderedFolders?.children || activeFolder;
    }
    else if (activeFolder?.length === undefined) {
        currentFolder = JSON.parse(localStorage.getItem("currentFolder"))
    }

    let displayRenderedFolders = currentFolder;

    if (activeFolder && activeFolder.children) {
        displayRenderedFolders = activeFolder.children;
    }

    return (
        <div className="MaxWidth">
            <div className="FolderPath StartFormLeft">
                {path.map((folder, index) => (
                    <span key={index}>
                        {folder}
                        {index < path.length - 1 && <span> / </span>}
                    </span>
                ))}
            </div>
            {path[0] && <hr />}
            <div className="ToLeft">
                {activeFolder && (
                    <div className="SwitchBtn">
                        <button className="ReturnBtn" onClick={handleReturn}>
                            ⏎
                        </button>
                        <div className="AddButtons">
                            <button className="AddFolderBtn" onClick={handleAddChildFolder}>
                                + &nbsp;&nbsp;Add Folder
                            </button>
                            <FileExplorer currentFolder={activeFolder} currentFolderAddFile={handleAddFile} className="AddFolderBtn" />
                        </div>
                    </div>
                )}
            </div>
            <div>
                <div>
                    {emptyFolder !== true && (
                        <div className="DisplayColumn">
                            {emptyFolder !== true && path.length !== 0 && displayRenderedFolders[0] &&
                                <div>
                                    <p>Folders:</p>
                                </div>
                            }
                            <div className="DisplayRow">
                                {renderFolders(displayRenderedFolders, path, true)}
                            </div>
                        </div>
                    )}
                    {emptyFolder === true && parentFolder && parentFolder.files.length === 0 && (
                        <p className="Space">Empty folder</p>
                    )}
                </div>
                {parentFolder && parentFolder.files.length !== 0 && (
                    <div className="DisplayColumn">
                        <p>Files:</p>
                        <div className="DisplayRow">
                            {parentFolder?.files?.map((file, index) => (
                                <div className="FileNameDisplay" key={`file_${index}`} file={file}>
                                    <div className="MinWidth DisplayIcon">
                                        <span className="MinWidthName">
                                            {file.name + "." + file.extension}
                                        </span>
                                        {file.type.split("/")[1] === "pdf" && <img src={PDFIcon} alt="logo" />}
                                        {(file.type.split("/")[1] === "jpeg" || file.type.split("/")[1] === "jpg" || file.type.split("/")[1] === "png") && <img src={PNGIcon} alt="logo" />}
                                        {(file.type.split("/")[1] === "doc" || file.type.split("/")[1] === "docx") && <img src={DocxIcon} alt="logo" />}
                                        {(file.type.split("/")[1] === "xls" || file.type.split("/")[1] === "xlsx") && <img src={ExcelIcon} alt="logo" />}
                                    </div>
                                    <div className="DisplayColumnDownload">
                                        <button className="DeleteBtn" onClick={() => handleEditFileName(parentFolder, file)}>
                                            🖊️
                                        </button>
                                        <button className="DeleteBtn" onClick={() => { handleDeleteFile(parentFolder, file) }}>
                                            ✘
                                        </button>
                                    </div>
                                    <div>
                                        <button className="DownloadBtn" onClick={() => handleFileDownload(file)}>
                                            <span className="IconColor">⬇</span>
                                        </button>
                                        <button className="DeleteBtn" onClick={() => openFileDetailsPopup(file)}>📊</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {/* Render the file details pop-up */}
            {isPopupOpen && (
                <div className="Popup">
                    <div className="CloseBtn"><button className="DeleteBtn" onClick={closeFileDetailsPopup}>✘</button></div>
                    {/* Content to display file details */}
                    <h1 className="DetailsSub">File Details</h1>
                    {fileDetails && (
                        <div>
                            <p>Name: {fileDetails.name}</p>
                            <p>Size: {fileDetails.size + " bytes"}</p>
                            <p>Type: {fileDetails.type}</p>
                            <p>Extension: {fileDetails.extension}</p>
                            <p>Last Modified: {fileDetails.lastModifiedDate}</p>
                            <p>Created At: {fileDetails.createdAt}</p>
                        </div>
                    )}
                    <br />
                    <button onClick={closeFileDetailsPopup}>Close</button>
                </div>
            )}
        </div>
    );
}

export default GenericFolder;