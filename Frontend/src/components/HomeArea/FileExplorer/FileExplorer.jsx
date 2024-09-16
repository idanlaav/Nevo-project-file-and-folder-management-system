import React from "react";
import axios from "axios";

const maxFileSizeInBytes = 25 * 1024 * 1024;

function FileExplorer({ currentFolder, currentFolderAddFile }) {

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > maxFileSizeInBytes) {
                // File size exceeds the limit
                alert('File size exceeds the allowed limit of 25MB.');
                return;
            }

            // Check if the file type is allowed
            const allowedFileTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'image/jpeg',
                'image/jpg',
                'image/png',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];
            const fileType = file.type;
            if (!allowedFileTypes.includes(fileType)) {
                // File type is not allowed
                alert('Invalid file type. Only PDF, Word.docx, JPEG, JPG, PNG, and Excel.xlsx files are allowed.');
                return;
            }

            handleFileUpload(file);
        }
    };

    const handleFileUpload = (file) => {

        const formData = new FormData();
        formData.append("file", file);

        axios
            .post("http://localhost:3001/api/upload", formData)
            .then((response) => {
                // Add the file to the current folder
                const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove the file extension
                const fileExtension = file.name.split(".").pop(); // Get the file extension

                const currentTime = new Date();

                const year = currentTime.getFullYear();
                const month = currentTime.getMonth() + 1; // Note: month starts from 0
                const day = currentTime.getDate();
                const hours = currentTime.getHours();
                const minutes = currentTime.getMinutes();
                const seconds = currentTime.getSeconds();

                let formattedDate;
                if(seconds < 10){
                    formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:0${seconds}`;
                }
                else {
                    formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                }

                const fileDetails = {
                    name: fileName,
                    extension: fileExtension,
                    type: file.type,
                    createdAt: formattedDate,
                    lastModifiedDate: formattedDate
                };

                currentFolderAddFile(fileDetails);
            })
            .catch((error) => {
                if (error.response && error.response.data) {
                    alert(error.response.data);
                } else {
                    alert("Failed to upload file.");
                }
                console.error(error);
            });
    };

    const handleClick = () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.style.display = "none";
        fileInput.addEventListener("change", handleFileChange);
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    };

    return (
        <div>
            <button className="NewBtn" onClick={handleClick}>
                + Add File
            </button>
        </div>
    );
}

export default FileExplorer;
