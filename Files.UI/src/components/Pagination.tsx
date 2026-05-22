import { useTranslation } from "react-i18next";

import { useKeyEvent } from '../useKeyEvent';

const range = (start, end, length = end - start + 1) =>
    Array.from({ length }, (_, i) => start + i)

export function Pagination({ className, paginationData, gotoPage, isInModal = false }) {
    const { t } = useTranslation();

    const { page, pageTotal } = paginationData;

    const middleLow = Math.max(page - 5, 1);
    const middleHigh = Math.min(middleLow + 10, pageTotal);

    useKeyEvent((event) => {
        if (isInModal) {
            return;
        }

        if (event.key.toLowerCase() === 'arrowright') {
            if (event.srcElement instanceof HTMLInputElement === false) {
                event.preventDefault();
                event.stopPropagation();
                if (page < pageTotal) {
                    gotoPage(page + 1);
                }
            }
        }
        if (event.key.toLowerCase() === 'arrowleft') {
            if (event.srcElement instanceof HTMLInputElement === false) {
                event.preventDefault();
                event.stopPropagation();
                if (page > 1) {
                    gotoPage(page - 1);
                }
            }
        }
    }, this);

    return (
        <nav className={className}>
            <ul className="pagination">
                <li className={"page-item" + (page === 1 ? " disabled" : "")}>
                    <a className="page-link" href="#" onClick={e => { e.preventDefault(); gotoPage(page - 1); }}>{t("previous")}</a>
                </li>
                {middleLow > 1 &&
                    <li className="page-item">
                        <a className="page-link" href="#" onClick={e => { e.preventDefault(); gotoPage(1); }}>1</a>
                    </li>
                }
                {middleLow > 2 &&
                    <li className="page-item disabled">
                        <a className="page-link" href="#">...</a>
                    </li>
                }
                {range(middleLow, middleHigh).map(p =>
                    <li key={p} className={"page-item" + (p === page ? " active" : "")}>
                        <a className="page-link" href="#" onClick={e => { e.preventDefault(); gotoPage(p); }}>{p}</a>
                    </li>
                )}
                {middleHigh < (pageTotal - 1) &&
                    <li className="page-item disabled">
                        <a className="page-link" href="#">...</a>
                    </li>
                }
                {middleHigh < pageTotal &&
                    <li className="page-item">
                        <a className="page-link" href="#" onClick={e => { e.preventDefault(); gotoPage(pageTotal); }}>{pageTotal}</a>
                    </li>
                }
                <li className={"page-item" + (page === pageTotal || pageTotal === 0 ? " disabled" : "")}>
                    <a className="page-link" href="#" onClick={e => { e.preventDefault(); gotoPage(page + 1); }}>{t("next")}</a>
                </li>
            </ul>
        </nav>
    );
}