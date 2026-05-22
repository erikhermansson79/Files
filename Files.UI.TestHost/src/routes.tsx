import App from './App';
import Files from './Files';
import SelectImage from './SelectImage';

const routes = [
    {
        path: "",
        element: <App />,
        children: [
            {
                path: "files/*",
                element: <Files />
            },
            {
                path: "selectImage",
                element: <SelectImage />
            }
        ]
    }
];

export default routes;