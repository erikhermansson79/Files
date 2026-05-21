export async function getFolderContentAsync(path, page, pageSize, thumbnails?, thumbnailSize?) {
    let url = `/api/files/${path}?page=${page}&pageSize=${pageSize}`;
    if (thumbnails) {
        url += `&thumbnails=true`;
        if (thumbnailSize) {
            url += `&thumbnailSize=${thumbnailSize}`;
        }
    }

    return await fetch(`${window.location.origin}${url}`, {
        credentials: "include"
    });
}

export async function getThumbnailAsync(path, size?) {
    let url = `/api/files/Thumbnail/${path}`;
    if (size) {
        url += `?size=${size}`;
    }

    const response = await fetch(`${window.location.origin}${url}`, {
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch thumbnail for ${path}: ${response.status}`);
    }

    return await response.blob();
}

export async function postDownloadAsync(paths) {
    var myform = document.createElement("form");
    myform.action = `${window.location.origin}/api/files/download`;
    myform.method = "POST";

    myform.addEventListener("submit", (e) => {
        new FormData(myform);
    });
    myform.addEventListener("formdata", (e: any) => {
        const data = e.formData;
        for (const path of paths) {
            data.append('paths', path);
        }
    });

    document.body.appendChild(myform);
    myform.submit();
    document.body.removeChild(myform);
}

export async function postCreateFolderAsync(location, name) {
    return await fetch(`${window.location.origin}/api/files/CreateFolder`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            folderName: name,
            location
        })
    });
}

export async function postCreateURLAsync(location, name, link) {
    return await fetch(`${window.location.origin}/api/files/CreateURL`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            displayName: name,
            url: link,
            location
        })
    });
}

export async function postChangeItemNameAsync(target, name, type) {
    return await fetch(`${window.location.origin}/api/files/ChangeItemName`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            type,
            name,
            target
        })
    });
}

export async function postToggleItemHiddenAsync(target, type) {
    return await fetch(`${window.location.origin}/api/files/ToggleItemHidden`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            type,
            target
        })
    });
}

export async function postDeleteItemAsync(target, type) {
    return await fetch(`${window.location.origin}/api/files/DeleteItem`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            type,
            target
        })
    });
}

export async function postMoveItemAsync(target, destination, type) {
    return await fetch(`${window.location.origin}/api/files/MoveItem`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            type,
            target,
            destination
        })
    });
}

export async function postCopyItemAsync(target, destination, type) {
    return await fetch(`${window.location.origin}/api/files/CopyItem`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            type,
            target,
            destination
        })
    });
}

export async function uploadFileAsync(data) {
    return await fetch(`${window.location.origin}/api/files/UploadFileChunk`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
}