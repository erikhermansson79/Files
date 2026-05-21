import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'

export function Breadcrumbs({ strategy, breadcrumbs, ...restProps }) {
    const { t } = useTranslation();

    const [first, ...rest] = breadcrumbs;

    var path = breadcrumbs.length === 1 ? undefined : "";

    const crumbs = [{ name: t(first), path: path }];

    var count = 1;
    for (const bc of rest) {
        count++;
        path = count === breadcrumbs.length ? undefined : (path ? `${path}/${bc}` : bc);
        crumbs.push({ name: bc, path: path });
    }

    return (
        <ol {...restProps}>
            {crumbs.map(bc => (
                <li key={bc.name} className="d-inline-block fs-4">
                    {bc.path !== undefined &&
                        <>
                        <span className="link text-muted m-0 p-0 border-0 fs-4" onClick={e => { e.stopPropagation(); strategy.gotoPath(bc.path); }}>{bc.name}</span>
                        <FontAwesomeIcon icon={faChevronRight} className="mx-2 fs-6 text-muted" />
                        </>
                    }
                    {bc.path === undefined && <span className="">{bc.name}</span>}
                </li>
            ))}
        </ol>
    );
}