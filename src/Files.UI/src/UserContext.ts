import React from "react";

const defaultValue = {
    isAdmin: false,
    disablePagingInFiles: false
}

export const UserContext = React.createContext(defaultValue);