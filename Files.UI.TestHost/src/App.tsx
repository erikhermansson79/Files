import { Outlet, NavLink } from 'react-router-dom';

export default function App() {
    return (
        <div>
            <nav className="navbar bg-body-tertiary">
                <div className="container-fluid">
                    <ul className="nav nav-pills">
                        <li className="nav-item">
                            <NavLink to='files' className="nav-link">Filer</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to='selectImage' className="nav-link">Välj bild</NavLink>
                        </li>
                    </ul>
                </div>
            </nav>
            <main>
                <Outlet />
            </main>
        </div>
    );
}